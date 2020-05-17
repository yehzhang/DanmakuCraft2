import { Store } from '../redux';
import setupExternalDependency from './setupExternalDependency';
import setUpGameContainerElement from './setUpGameContainerElement';
import setUpUser from './setUpUser';

async function setUpBilibiliShim(store: Store): Promise<string> {
  setUpUser(store);
  setupExternalDependency(store);
  return setUpGameContainerElement();
}

export default setUpBilibiliShim;
