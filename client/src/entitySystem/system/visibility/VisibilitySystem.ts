import {Phaser} from '../../../util/alias/phaser';
import {Component} from '../../alias';

interface VisibilitySystem<T extends Component> {
  /**
   * Called when {@param component} enters the field of view of an entity specified when this
   * system is registered. A system registered first got this method called first.
   */
  enter(component: T): void;

  /**
   * Called every tick as long as {@param component} stays within the field of view of an entity
   * specified when this system is registered. A system registered first got this method called
   * first.
   */
  update(component: T, time: Phaser.Time): void;

  /**
   * Called when {@param component} exits the field of view of an entity specified when this system
   * is registered. A system registered first got this method called last.
   */
  exit(component: T): void;

  /**
   * Called once per tick if {@link enter} or {@link exit} is called. The order of calling relative
   * to other systems is undefined.
   */
  finish(): void;
}

export default VisibilitySystem;
