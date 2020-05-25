import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';
import { Provider } from 'react-redux';
import 'resize-observer-polyfill';
import './action'; // Hack for webpack to pickup interface-only files.
import App from './component/App';
import { loadBackgroundMusic } from './component/BackgroundMusic';
import { addLoadingTask, LoadingResult } from './component/Loading';
import './data/entity';
import getLatestCommentEntities from './shim/backend/getLatestCommentEntities';
import initialize from './shim/backend/initialize';
import setUpBilibiliShim from './shim/bilibili';
import ConsoleInput from './shim/ConsoleInput';
import { selectDomain } from './shim/domain';
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

  initialize();
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
    for (const commentEntityChunk of _.chunk(commentEntities, 100)) {
      while (
        !throttler.run(() => {
          store.dispatch({
            type: '[index] Comments loaded from backend',
            data: commentEntityChunk,
          });
        }, sleepDurationMs)
      ) {
        await sleep(sleepDurationMs);
      }
    }
  };
}

main();
