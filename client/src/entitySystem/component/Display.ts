import {PIXI} from '../../util/alias/phaser';
import Entity from '../Entity';

class Display<T = PIXI.DisplayObjectContainer> {
  constructor(public display: T) {
  }

  getDisplayWorldBounds(this: Entity & Display<PIXI.DisplayObjectContainer>) {
    let bounds = this.display.getLocalBounds().clone();
    let coordinates = this.coordinates;
    bounds.x += coordinates.x;
    bounds.y += coordinates.y;

    return bounds;
  }
}

export default Display;
