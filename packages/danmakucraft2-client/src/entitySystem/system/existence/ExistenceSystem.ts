import {Component} from '../../alias';

interface ExistenceSystem<T extends Component> {
  enter(component: T): void;

  exit(component: T): void;

  /**
   * Called once per tick if {@link enter} or {@link exit} is called.
   */
  finish(): void;
}

export default ExistenceSystem;
