class Perspective<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  private internalZ: number;

  constructor(
      public display: T,
      z: number,
      public focalLength: number,
      public tweenAlpha: boolean = false,
      public gravitateToCenter: boolean = false,
      public x: number = display.x,
      public y: number = display.y,
      public perspective: number = 0) {
    this.z = z;
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

    let positionPerspective;
    if (this.gravitateToCenter) {
      positionPerspective = this.perspective ** 2;
    } else {
      positionPerspective = this.perspective;
    }
    this.display.x = this.x * positionPerspective;
    this.display.y = this.y * positionPerspective;

    this.display.scale.setTo(this.perspective);

    if (this.tweenAlpha) {
      this.display.alpha = Math.min(this.perspective * 10, 1);
    }
  }
}

export default Perspective;
