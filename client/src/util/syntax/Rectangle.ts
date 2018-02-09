import {Phaser} from '../alias/phaser';
import Point from './Point';

class Rectangle extends Phaser.Rectangle {
  static of(x: number, y: number, width: number, height: number) {
    return new this(x, y, width, height);
  }

  // noinspection JSSuspiciousNameCombination
  static sized(width: number, height: number = width) {
    return new this(0, 0, width, height);
  }

  static empty() {
    return new this(0, 0, 0, 0);
  }

  static inflateFrom(point: Point, dx: number, dy: number = dx) {
    return new this(point.x - dx, point.y - dy, dx * 2, dy * 2);
  }
}

export default Rectangle;
