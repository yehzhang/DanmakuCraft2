import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'resize-observer-polyfill';
import './action'; // Hack for webpack to pickup interface-only files.
import App from './component/App';
import './data/entity';
import ConsoleInput from './shim/ConsoleInput';
import { selectDomain } from './shim/domain';
import './state';
import store, { persistor } from './store';
import whyDidYouRender from './whyDidYouRender';

async function main() {
  if (__DEV__) {
    await whyDidYouRender();

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

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById(gameContainerId)
  );
}

main();
