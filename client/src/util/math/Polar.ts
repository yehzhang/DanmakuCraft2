import {Phaser} from '../alias/phaser';
import Point from '../syntax/Point';

abstract class Polar {
  /**
   * @return azimuth and radius.
   */
  static from(point: Point): [number, number] {
    const azimuth = Phaser.Math.angleBetween(0, 0, point.x, point.y);
    const radius = point.getMagnitude();
    return [azimuth, radius];
  }
}

export default Polar;
