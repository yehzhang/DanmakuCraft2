import Point from '../syntax/Point';

abstract class Polar {
  /**
   * @return azimuth and radius.
   */
  static from(point: Point): [number, number] {
    let azimuth = Phaser.Math.angleBetween(0, 0, point.x, point.y);
    let radius = point.getMagnitude();
    return [azimuth, radius];
  }
}

export default Polar;
