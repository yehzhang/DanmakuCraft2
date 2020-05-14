import { Store } from '../redux';
import setupExternalDependency from './setupExternalDependency';
import setUpGameContainerElement from './setUpGameContainerElement';
import setUpUser from './setUpUser';

async function setup(store: Store): Promise<string> {
  setUpUser(store);
  const $ = await setupExternalDependency(store);
  return setUpGameContainerElement($);
}

export default setup;
