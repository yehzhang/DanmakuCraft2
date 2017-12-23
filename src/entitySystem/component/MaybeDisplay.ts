class MaybeDisplay<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private displayInternal?: T;

  constructor(private createDisplay: (entity: any) => T, display?: T) {
    this.displayInternal = display;
  }

  get display(): T {
    if (this.displayInternal === undefined) {
      throw new TypeError('Display is not available');
    }
    return this.displayInternal;
  }

  hasDisplay() {
    return this.display !== undefined;
  }

  // TODO object pooling?
  releaseDisplay() {
    if (this.displayInternal === undefined) {
      throw new TypeError('Display is not available');
    }
    this.displayInternal = undefined;
  }

  acquireDisplay() {
    if (this.displayInternal !== undefined) {
      throw new TypeError('Display is already acquired');
    }
    this.displayInternal = this.createDisplay(this);
  }
}

export default MaybeDisplay;
