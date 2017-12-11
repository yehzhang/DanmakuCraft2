import {toWorldCoordinate2d, toWorldCoordinateOffset2d} from '../../law';
import PhysicalConstants from '../../PhysicalConstants';

abstract class Coordinates {
  protected point: Phaser.Point;

  constructor(coordinates: Phaser.Point) {
    this.point = toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE);
  }

  /**
   * Returns internal coordinates. Modifying them directly may or may not change the internal ones.
   */
  abstract get coordinates(): Phaser.Point;

  /**
   * Returns internal coordinates as an offset to {@param coordinates} as they are world
   * coordinates.
   */
  asOffsetTo(coordinates: Phaser.Point): Phaser.Point {
    return toWorldCoordinateOffset2d(this.point, coordinates, PhysicalConstants.WORLD_SIZE);
  }
}

export default Coordinates;
