import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';
import { Provider } from 'react-redux';
import 'resize-observer-polyfill';
import './action'; // Hack for webpack to pickup interface-only files.
import App from './component/App';
import { addLoadingTask, LoadingResult } from './component/Loading';
import './data/entity';
import { getFromBackend } from './shim/backend';
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

  addLoadingTask(loadCommentsFromBackend());

  const gameContainerId = await selectDomain<() => Promise<string> | string>({
    bilibili: () => setUpBilibiliShim(store),
    danmakucraft: () => {
      store.dispatch({ type: '[TEST] signed in' });
      return 'danmakucraft-container';
    },
  })();

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById(gameContainerId)
  );
}

function loadCommentsFromBackend(): () => Promise<LoadingResult> {
  const commentDataPromise = getFromBackend('comment');
  return async () => {
    const { comments: flatComments } = await commentDataPromise;
    const throttler = new RenderThrottler();
    const sleepDurationMs = 2;
    for (const flatCommentChunk of _.chunk(flatComments, 100)) {
      while (
        !throttler.run(() => {
          store.dispatch({ type: 'Comments loaded from backend', data: flatCommentChunk });
        }, sleepDurationMs)
      ) {
        await sleep(sleepDurationMs);
      }
    }
  };
}

main();
