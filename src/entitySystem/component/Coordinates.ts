import {toWorldCoordinate2d, toWorldCoordinateOffset2d} from '../../law';
import PhysicalConstants from '../../PhysicalConstants';
import Point from '../../util/syntax/Point';

abstract class Coordinates {
  protected point: Point;

  constructor(coordinates: Point) {
    this.point = toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE);
  }

  /**
   * Returns internal coordinates. Modifying them directly may or may not change the internal ones.
   */
  abstract get coordinates(): Point;

  /**
   * Returns internal coordinates as an offset to {@param coordinates} as they are world
   * coordinates.
   */
  asOffsetTo(coordinates: Point): Point {
    return toWorldCoordinateOffset2d(this.point, coordinates, PhysicalConstants.WORLD_SIZE);
  }
}

export default Coordinates;
