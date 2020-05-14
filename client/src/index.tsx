import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';
import 'resize-observer-polyfill';
import './action'; // Hack for webpack to pickup interface-only files.
import App from './component/App';
import './data/entity';
import { SpawnPointEntity, WorldCenterEntity, WorldOriginEntity } from './data/entity';
import { empty, Point, zip } from './data/point';
import { sampleUniformDistributionInCircle } from './data/random';
import { worldSize } from './data/unboundedWorld';
import ConsoleInput from './shim/ConsoleInput';
import { selectDomain } from './shim/domain';
import './state';
import store, { persistor } from './store';

genesis();

async function genesis() {
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
    x: halfWorldSize,
    y: halfWorldSize,
  };

  const worldOriginEntity: WorldOriginEntity = {
    type: 'world_origin',
    ...empty,
  };

  store.dispatch({
    type: 'Genesis',
    spawnPosition: generateRandomPointAround(__DEV__ ? empty : getRandomSpawnPoint(spawnPoints)),
    signEntities: [...spawnPoints, worldCenterEntity, worldOriginEntity],
  });

  if (__DEV__) {
    const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      include: [/.*/],
      exclude: [/^ConsoleDisplay/, /^Ticker$/, /^TinyTelevision$/, /^SpeechBubble_?$/],
      trackExtraHooks: [[ReactRedux, 'useSelector']],
    });

    window.d = new ConsoleInput(store);
    window.store = store;
    window.persistor = persistor;
  }

  const gameContainerId = await selectDomain<() => Promise<string> | string>({
    bilibili: async () => {
      const { default: setUp } = await import('./shim/bilibili');
      return setUp(store);
    },
    danmakucraft: () => {
      store.dispatch({ type: '[TEST] signed in' });
      return 'danmakucraft-container';
    },
  })();

  ReactDOM.render(<App />, document.getElementById(gameContainerId));
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
  return zip(point, randomOffsets, _.add);
}
