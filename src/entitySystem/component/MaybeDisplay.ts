class MaybeDisplay<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private displayInternal: T | null;
  private createDisplayInternal: (entity: any) => T;

  constructor(createDisplay: (entity: any) => T) {
    this.displayInternal = null;
    this.createDisplayInternal = createDisplay;
  }

  get display(): T {
    if (this.displayInternal == null) {
      throw new TypeError('Display is not available');
    }
    return this.displayInternal;
  }

  hasDisplay() {
    return this.display != null;
  }

  // TODO object pooling?
  releaseDisplay() {
    if (this.displayInternal == null) {
      throw new TypeError('Display is not available');
    }
    this.displayInternal = null;
  }

  acquireDisplay() {
    if (this.displayInternal != null) {
      throw new TypeError('Display is already acquired');
    }
    this.displayInternal = this.createDisplayInternal(this);
  }
}

export default MaybeDisplay;
