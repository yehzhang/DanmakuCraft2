import { addLoadingTask } from '../../component/Loading';
import { Store } from '../redux';

async function setupExternalDependency(store: Store): Promise<JQueryStatic> {
  const promise = setupAfterExternalDependencyReady(store);
  addLoadingTask(async () => {
    await promise;
  });

  return promise;
}

async function setupAfterExternalDependencyReady(store: Store): Promise<JQueryStatic> {
  return new Promise((resolve) => {
    const check = () => {
      const $ = (window as any).$;
      if (!$) {
        setTimeout(check, 100);
        return;
      }

      store.dispatch({ type: '[shim/bilibili] external dependency ready', $ });

      resolve($);
    };

    check();
  });
}

export default setupExternalDependency;
