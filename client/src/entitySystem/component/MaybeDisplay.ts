import {PIXI} from '../../util/alias/phaser';

class MaybeDisplay<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private internalDisplay?: T;

  constructor(display: T) {
    this.internalDisplay = display;
  }

  get display(): T {
    if (this.internalDisplay === undefined) {
      throw new TypeError('Display is not available');
    }
    return this.internalDisplay;
  }

  hasDisplay() {
    return this.internalDisplay !== undefined;
  }

  releaseDisplay() {
    if (this.internalDisplay === undefined) {
      throw new TypeError('Display is released already');
    }
    this.internalDisplay = undefined;
  }
}

export default MaybeDisplay;
