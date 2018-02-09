import Coordinates from './Coordinates';
import {toWorldCoordinate2d} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import Point from '../../util/syntax/Point';

abstract class CoordinatesBase implements Coordinates {
  protected point: Point;

  constructor(coordinates: Point) {
    this.point = toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE);
  }

  /**
   * Returns internal coordinates. Modifying them directly may or may not change the internal ones.
   */
  get coordinates(): Point {
    return this.point.clone();
  }
}

export default CoordinatesBase;
