import Point from '../syntax/Point';
import PhysicalConstants from '../../PhysicalConstants';
import {toWorldCoordinateOffset2d, validateRadius} from '../../law/space';

class Distance {
  private maxDistanceSquared: number;

  constructor(maxDistanceToBeClose: number) {
    validateRadius(maxDistanceToBeClose);
    this.maxDistanceSquared = maxDistanceToBeClose ** 2;
  }

  /**
   * @return Not an exact distance, but a comparable distance.
   */
  static roughlyOf(coordinates: Point, other: Point) {
    return this.squaredOf(coordinates, other);
  }

  static of(coordinates: Point, other: Point) {
    let distanceSquared = this.squaredOf(coordinates, other);
    return Math.sqrt(distanceSquared);
  }

  private static squaredOf(coordinates: Point, other: Point) {
    let offset = toWorldCoordinateOffset2d(coordinates, other, PhysicalConstants.WORLD_SIZE);
    return offset.dot(offset);
  }

  isClose(coordinates: Point, other: Point) {
    return Distance.squaredOf(coordinates, other) < this.maxDistanceSquared;
  }
}

export default Distance;
