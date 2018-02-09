import {Phaser} from '../alias/phaser';

class Point extends Phaser.Point {
  static of(x: number, y: number) {
    return new this(x, y);
  }

  static from(point: Phaser.Point) {
    return new this(point.x, point.y);
  }

  static origin() {
    return new this();
  }

  static ofPolar(azimuth: number, radius: number) {
    return new this().setToPolar(azimuth, radius);
  }
}

export default Point;
