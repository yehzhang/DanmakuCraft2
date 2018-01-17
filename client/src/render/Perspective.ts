class Perspective<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private internalZ: number;

  constructor(
      public display: T,
      z: number,
      public focalLength: number,
      public tweenAlpha: boolean = true,
      public x: number = display.x,
      public y: number = display.y,
      public perspective: number = 0) {
    this.z = z;
    this.updatePerspective();
  }

  get z() {
    return this.internalZ;
  }

  set z(z: number) {
    this.internalZ = z;
    this.updatePerspective();
  }

  get visible() {
    return this.display.visible;
  }

  set visible(value: boolean) {
    this.display.visible = value;
  }

  private updatePerspective() {
    this.perspective = Math.max(this.focalLength / (this.focalLength + this.internalZ), 0);

    let perspectiveSquared = this.perspective ** 2;
    this.display.x = this.x * perspectiveSquared;
    this.display.y = this.y * perspectiveSquared;

    this.display.scale.setTo(this.perspective);

    if (this.tweenAlpha) {
      this.display.alpha = Math.min(this.perspective * 10, 1);
    }
  }
}

export default Perspective;
