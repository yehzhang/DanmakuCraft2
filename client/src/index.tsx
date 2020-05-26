import { Howl } from 'howler';
import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';
import { Provider } from 'react-redux';
import 'resize-observer-polyfill';
import backgroundMusicConfig from '../../data/audio/background_music.json';
import './action'; // Hack for webpack to pickup interface-only files.
import App from './component/App';
import { addLoadingTask, LoadingResult } from './component/Loading';
import './data/entity';
import getLatestCommentEntities from './shim/backend/getLatestCommentEntities';
import getResourceUrls from './shim/backend/getResourceUrls';
import initializeBackend from './shim/backend/initializeBackend';
import setUpBilibiliShim from './shim/bilibili';
import ConsoleInput from './shim/ConsoleInput';
import { selectDomain } from './shim/domain';
import initializeLogging from './shim/logging/initializeLogging';
import ParametricTypeError from './shim/logging/ParametricTypeError';
import RenderThrottler from './shim/pixi/RenderThrottler';
import sleep from './shim/sleep';
import './state';
import store, { persistor } from './store';

async function main() {
  if (__DEV__) {
    const { default: whyDidYouRender_ } = await import('@welldone-software/why-did-you-render');
    whyDidYouRender_(React, {
      trackAllPureComponents: true,
      include: [/.*/],
      exclude: [/^ConsoleDisplay/, /^Ticker$/],
      trackExtraHooks: [[ReactRedux, 'useSelector']],
    });

    window.d = new ConsoleInput(store);
    window.store = store;
    window.persistor = persistor;
  }

  initializeLogging();
  initializeBackend();
  addLoadingTask(loadCommentsFromBackend());
  addLoadingTask(_.constant(loadBackgroundMusic()));

  const gameContainerId = await selectDomain<() => Promise<string> | string>({
    bilibili: () => setUpBilibiliShim(store),
    danmakucraft: () => 'danmakucraft-container',
  })();

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById(gameContainerId)
  );
}

function loadCommentsFromBackend(): () => Promise<LoadingResult> {
  const commentEntitiesPromise = getLatestCommentEntities();
  return async () => {
    const commentEntities = await commentEntitiesPromise;
    const throttler = new RenderThrottler();
    const sleepDurationMs = 2;
    for (const commentEntityChunk of chunkObject(commentEntities, 100)) {
      while (
        !throttler.run(() => {
          store.dispatch({
            type: '[index] comment entities loaded',
            commentEntities: commentEntityChunk,
          });
        }, sleepDurationMs)
      ) {
        await sleep(sleepDurationMs);
      }
    }
  };
}

function chunkObject<T extends object>(data: T, size: number): T[] {
  return _.chunk(Object.entries(data), size).map(Object.fromEntries);
}

function loadBackgroundMusic(): Promise<void> {
  return new Promise((resolve, reject) => {
    const album = new Howl({
      src: [
        getResourceUrls('background_music.mp3'),
        getResourceUrls('background_music.ogg'),
        getResourceUrls('background_music.m4a'),
      ],
      sprite: backgroundMusicConfig.sprite as any,
      onload: () => void resolve(),
      onloaderror: (id, error) =>
        void reject(
          new ParametricTypeError('Unexpected error when loading background music', { error })
        ),
    });
    store.dispatch({ type: '[index] background music created', album });
  });
}

main();
