import {PIXI} from '../../util/alias/phaser';

class Display<T = PIXI.DisplayObject> {
  constructor(public display: T) {
  }
}

export default Display;
