import add from 'lodash/add';
import mapKeys from 'lodash/mapKeys';
import { nanoid } from 'nanoid';
import * as React from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import { Action } from '../action';
import { bottomRight } from '../data/anchors';
import { black, white } from '../data/color';
import { SpawnPointEntity, WorldCenterEntity, WorldOriginEntity } from '../data/entity';
import { empty, fromNumber, Point, zip } from '../data/point';
import { sampleUniformDistributionInCircle } from '../data/random';
import { worldSize } from '../data/unboundedWorld';
import { useDispatch, useSelector } from '../shim/redux';
import sleep from '../shim/sleep';
import DanmakuParticleField from './DanmakuParticleField';
import DanmakuPlanet from './DanmakuPlanet';
import Loading from './Loading';
import OpeningFadeOut from './OpeningFadeOut';
import OpeningTitle from './OpeningTitle';

function Opening() {
  const [state, openingDispatch] = useReducer(reducer, initialState);
  const { x: width, y: height } = useSelector((state_) => state_.containerSize);
  const vanishingPoint = { x: width * 0.5, y: height * 0.5 };
  const successfulExiting = state.stage === 'exiting_successful';
  const dispatch = useDispatch();
  const onComplete = useCallback(async () => {
    if (successfulExiting) {
      if (__DEV__) {
        // Hack to mitigate the memory leak warning due to synchronous `setState()` in dev build.
        await sleep(0);
      }
      dispatch({ type: '[Opening] completed' });
    }
  }, [dispatch, successfulExiting]);

  useEffect(() => {
    dispatch(genesis());
  }, [dispatch]);

  const authenticated = useSelector((state_) => state_.authenticated);
  useEffect(() => {
    if (authenticated) {
      openingDispatch('Signed in');
    }
  }, [authenticated]);

  return (
    <>
      <DanmakuParticleField observerZ={successfulExiting ? 60 : 0} />
      <DanmakuPlanet
        x={width * 0.5}
        y={height * 0.5}
        vanishingPointX={vanishingPoint.x}
        vanishingPointY={vanishingPoint.y}
        stage={successfulExiting ? 'exiting' : 'entering'}
        dispatch={openingDispatch}
      />
      <OpeningTitle
        x={width * 0.5}
        y={height * 0.3}
        vanishingPointX={vanishingPoint.x}
        vanishingPointY={vanishingPoint.y}
        stage={successfulExiting ? 'exiting' : 'entering'}
        dispatch={openingDispatch}
      />
      {state.stage === 'exiting_failed' && <OpeningFadeOut color={black} onComplete={onComplete} />}
      <Loading
        x={width * 0.95}
        y={height * 0.95}
        anchor={bottomRight}
        dispatch={openingDispatch}
        startHeavyTasks={state.stage === 'heavy_loading'}
      />
      {successfulExiting && <OpeningFadeOut color={white} onComplete={onComplete} />}
    </>
  );
}

type OpeningState =
  | {
      readonly stage: 'entering';
      readonly titleEntered: boolean;
      readonly planetEntered: boolean;
      readonly signedIn: boolean;
    }
  | {
      readonly stage: 'heavy_loading';
    }
  | {
      readonly stage: 'exiting_successful';
    }
  | {
      readonly stage: 'exiting_failed';
    };
type OpeningAction =
  | 'Title entered'
  | 'Planet entered'
  | 'Signed in'
  | 'Successfully loaded'
  | 'Failed to load';

const initialState: OpeningState = {
  stage: 'entering',
  titleEntered: false,
  planetEntered: false,
  signedIn: false,
};

function reducer(state: OpeningState, action: OpeningAction): OpeningState {
  switch (action) {
    case 'Title entered':
      return state.stage === 'entering'
        ? transitionToLoadingStateIfAllDone({ ...state, titleEntered: true })
        : state;
    case 'Planet entered':
      return state.stage === 'entering'
        ? transitionToLoadingStateIfAllDone({ ...state, planetEntered: true })
        : state;
    case 'Signed in':
      return state.stage === 'entering'
        ? transitionToLoadingStateIfAllDone({ ...state, signedIn: true })
        : state;
    case 'Successfully loaded':
      return { stage: 'exiting_successful' };
    case 'Failed to load':
      return { stage: 'exiting_failed' };
  }
}

function transitionToLoadingStateIfAllDone(
  state: Extract<OpeningState, { stage: 'entering' }>
): OpeningState {
  const { titleEntered, planetEntered, signedIn } = state;
  return titleEntered && planetEntered && signedIn ? { stage: 'heavy_loading' } : state;
}

function genesis(): Action {
  const spawnPoints: readonly SpawnPointEntity[] = [
    { type: 'spawn_point', x: 8424, y: 8586, text: '8' }, // NW
    { type: 'spawn_point', x: 16362, y: 9396, text: '1' }, // N
    { type: 'spawn_point', x: 24300, y: 8748, text: '6' }, // NE
    { type: 'spawn_point', x: 8748, y: 16038, text: '3' }, // W
    { type: 'spawn_point', x: 23652, y: 16524, text: '7' }, // E
    { type: 'spawn_point', x: 9072, y: 23976, text: '4' }, // SW
    { type: 'spawn_point', x: 16524, y: 23490, text: '⑨' }, // S
    { type: 'spawn_point', x: 23976, y: 23814, text: '2' }, // SE
  ];

  const halfWorldSize = worldSize / 2;
  const worldCenterEntity: WorldCenterEntity = {
    type: 'world_center',
    ...fromNumber(halfWorldSize),
  };

  const worldOriginEntity: WorldOriginEntity = {
    type: 'world_origin',
    ...empty,
  };

  return {
    type: '[Opening] genesis',
    spawnPosition: generateRandomPointAround(getRandomSpawnPoint(spawnPoints)),
    signEntities: mapKeys([...spawnPoints, worldCenterEntity, worldOriginEntity], () => nanoid()),
  };
}

function getRandomSpawnPoint(spawnPoints: readonly Point[]): Point {
  if (!spawnPoints.length) {
    return empty;
  }

  const spawnPointChangeInterval = new Date(0);
  spawnPointChangeInterval.setMinutes(5);
  spawnPointChangeInterval.setSeconds(17);
  const spawnPeriod = Math.floor(Date.now() / spawnPointChangeInterval.getTime());
  const spawnPointIndex = spawnPeriod % spawnPoints.length;
  return spawnPoints[spawnPointIndex];
}

function generateRandomPointAround(point: Point): Point {
  const maxOffset = __DEV__ ? 300 : 675;
  const randomOffsets = sampleUniformDistributionInCircle(maxOffset);
  return zip(point, randomOffsets, add);
}

export default Opening;
