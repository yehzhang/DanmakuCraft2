export class Point extends Phaser.Point {
  static of(x: number, y: number) {
    return new this(x, y);
  }

  static from(point: PIXI.Point) {
    return new this(point.x, point.y);
  }

  static origin() {
    return new this();
  }
}
