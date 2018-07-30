import {Component} from '../../alias';

interface ExistenceSystem<T extends Component> {
  /**
   * Called when {@param component} is registered. A system registered first got this method called
   * first.
   *
   * Note that an entity may be registered multiple times automatically in addition to the initial
   * registration, depending on the implementation of the engine.
   */
  adopt(component: T): void;

  /**
   * Called when {@param component} is deregistered. A system registered first got this method
   * called last.
   */
  abandon(component: T): void;
}

export default ExistenceSystem;
