import * as _ from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { grey } from '../data/color';
import { I18nTextIdentifier } from '../data/i18n';
import i18nData from '../data/i18n/zh';
import { getFromBackend } from '../shim/backend';
import RenderThrottler from '../shim/pixi/RenderThrottler';
import { memo } from '../shim/react';
import { PointLike } from '../shim/reactPixi';
import { Dispatch, useDispatch } from '../shim/redux';
import sleep from '../shim/sleep';
import FadeTransitionText from './FadeTransitionText';

interface Props {
  readonly x: number;
  readonly y: number;
  readonly anchor: PointLike;
  readonly dispatch: (action: 'Successfully loaded' | 'Failed to load') => void;
  readonly startHeavyTasks: boolean;
}

function Loading({ x, y, anchor, dispatch: parentDispatch, startHeavyTasks }: Props) {
  const [state, setState] = useState<State>({ type: 'initial' });
  const dispatch = useDispatch();
  useEffect(() => {
    async function run() {
      const beginMs = __DEV__ ? Date.now() : 0;

      let loadingResult: LoadingResult;
      try {
        const loadingResults = await Promise.race([
          executeGlobalLoadingTaskQueue(),
          loadingTimeout(),
        ]);
        loadingResult = loadingResults.find(Boolean);
      } catch (e) {
        console.error('Error when executing loading task queue.', e);
        loadingResult = 'mainSceneLoadingFailed';
      }

      if (__DEV__) {
        console.log(`Heavy task loading time: ${Math.round((Date.now() - beginMs) / 1000)}s.`);
      }

      if (loadingResult) {
        setState({ type: 'rejected', message: loadingResult });
        parentDispatch('Failed to load');
        return;
      }

      setState({ type: 'resolved' });
      parentDispatch('Successfully loaded');

      timeoutId = window.setTimeout(() => {
        setState({ type: 'end' });
      }, 5000);
    }

    if (!startHeavyTasks) {
      return;
    }

    let timeoutId: number | undefined;
    run();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [dispatch, startHeavyTasks]);

  useEffect(() => {
    setState({ type: 'pending' });
    addLoadingTask(loadCommentsFromBackend(dispatch));
  }, []);

  return (
    <FadeTransitionText x={x} y={y} color={grey} size={18} text={getText(state)} anchor={anchor} />
  );
}

type State =
  | { type: 'initial' }
  | { type: 'pending' }
  | { type: 'resolved' }
  | { type: 'rejected'; message: I18nTextIdentifier }
  | { type: 'end' };

function getText(state: State): string | null {
  switch (state.type) {
    case 'pending':
      return i18nData.mainSceneLoading;
    case 'resolved':
      return i18nData.mainSceneLoaded;
    case 'rejected':
      return i18nData[state.message];
    case 'initial':
    case 'end':
      return null;
  }
}

function loadCommentsFromBackend(dispatch: Dispatch): LoadingTask {
  const commentDataPromise = getFromBackend('comment');
  return async () => {
    const { comments: flatComments } = await commentDataPromise;
    const throttler = new RenderThrottler();
    const sleepDurationMs = 2;
    for (const flatCommentChunk of _.chunk(flatComments, 100)) {
      while (
        !throttler.run(() => {
          dispatch({ type: 'Comments loaded from backend', data: flatCommentChunk });
        }, sleepDurationMs)
      ) {
        await sleep(sleepDurationMs);
      }
    }
  };
}

async function loadingTimeout(): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new TypeError('Expected to finish loading within timeout')), 60000);
  });
}

async function executeGlobalLoadingTaskQueue(): Promise<LoadingResult[]> {
  if (executedGlobalLoadingTask) {
    return await executedGlobalLoadingTask;
  }

  if (!globalLoadingTasks) {
    return [];
  }
  const loadingTasks = globalLoadingTasks;
  globalLoadingTasks = null;

  const executedLoadingTask = Promise.all<LoadingResult>(loadingTasks.map((load) => load()));
  executedGlobalLoadingTask = executedLoadingTask;
  const loadingResults = await executedLoadingTask;
  executedGlobalLoadingTask = null;

  return loadingResults;
}

let globalLoadingTasks: LoadingTask[] | null = [];
let executedGlobalLoadingTask: Promise<LoadingResult[]> | null = null;

/** The heavy work should start after the function is called. */
type LoadingTask = () => Promise<LoadingResult> | LoadingResult;

/** `I18nTextIdentifier` in case of error. */
export type LoadingResult = I18nTextIdentifier | void;

/** Adds a global loading task executed independent of React lifecycle. */
export function addLoadingTask(load: LoadingTask) {
  if (!globalLoadingTasks) {
    console.error('Unexpected to register a task after loading started');
    load();
    return;
  }
  globalLoadingTasks.push(load);
}

export default memo(Loading);
