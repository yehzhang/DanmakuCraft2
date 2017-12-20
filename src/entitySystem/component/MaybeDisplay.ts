class MaybeDisplay<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private displayInternal?: T;
  private createDisplayInternal: (entity: any) => T;

  constructor(createDisplay: (entity: any) => T, display?: T) {
    this.displayInternal = display;
    this.createDisplayInternal = createDisplay;
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
    this.displayInternal = this.createDisplayInternal(this);
  }
}

export default MaybeDisplay;
