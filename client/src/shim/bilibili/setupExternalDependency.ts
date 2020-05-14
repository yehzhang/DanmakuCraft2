import { addLoadingTask } from '../../component/Loading';
import { Store } from '../redux';
import poll from './poll';

function setupExternalDependency(store: Store) {
  addLoadingTask(() => {
    poll(() => {
      const $ = (window as any).$;
      if (!$) {
        return null;
      }

      store.dispatch({ type: '[shim/bilibili] external dependency ready', $ });
    });
  });
}

export default setupExternalDependency;
