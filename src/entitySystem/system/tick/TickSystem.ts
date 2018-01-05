import {Component} from '../../alias';

interface TickSystem<T = Component> {
  update(entity: T, time: Phaser.Time): void;

  /**
   * Called once per tick.
   */
  tick(time: Phaser.Time): void;
}

export default TickSystem;
