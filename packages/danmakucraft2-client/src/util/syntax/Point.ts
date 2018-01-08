import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');

class Point extends Phaser.Point {
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

export default Point;
