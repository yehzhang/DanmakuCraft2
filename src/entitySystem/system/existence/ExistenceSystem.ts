import {Component} from '../../alias';

interface ExistenceSystem<T extends Component> {
  enter(component: T): void;

  exit(component: T): void;

  /**
   * Called once if {@link enter} or {@link exit} is called during a tick.
   */
  finish(): void;
}

export default ExistenceSystem;

