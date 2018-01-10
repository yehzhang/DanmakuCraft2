import {PIXI} from '../../util/alias/phaser';

class MaybeDisplay<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private internalDisplay?: T;

  constructor(private createDisplay: (entity: any) => T, display?: T) {
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

  // TODO object pooling?
  releaseDisplay() {
    if (this.internalDisplay === undefined) {
      throw new TypeError('Display is not available');
    }
    this.internalDisplay = undefined;
  }

  acquireDisplay() {
    if (this.internalDisplay !== undefined) {
      throw new TypeError('Display is already acquired');
    }
    this.internalDisplay = this.createDisplay(this);
  }
}

export default MaybeDisplay;
