import {Component} from '../../alias';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

interface TickSystem<T = Component> {
  update(entity: T, time: Phaser.Time): void;

  /**
   * Called once per tick.
   */
  tick(time: Phaser.Time): void;
}

export default TickSystem;
