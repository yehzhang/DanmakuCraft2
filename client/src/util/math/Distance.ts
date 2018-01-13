import Point from '../syntax/Point';
import PhysicalConstants from '../../PhysicalConstants';
import {toWorldCoordinateOffset2d, toWorldIntervalOffset, validateRadius} from '../../law/space';
import {DisplayableEntity} from '../../entitySystem/alias';

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
    return toWorldCoordinateOffset2d(coordinates, other, PhysicalConstants.WORLD_SIZE)
        .getMagnitudeSq();
  }

  isClose(coordinates: Point, other: Point) {
    return Distance.squaredOf(coordinates, other) <= this.maxDistanceSquared;
  }

  isDisplayClose(entity: DisplayableEntity, other: Point) {
    let bounds = entity.getDisplayWorldBounds();
    let horizontalOffset = toWorldIntervalOffset(
        bounds.left,
        bounds.right,
        other.x,
        PhysicalConstants.WORLD_SIZE);
    let verticalOffset = toWorldIntervalOffset(
        bounds.top,
        bounds.bottom,
        other.y,
        PhysicalConstants.WORLD_SIZE);
    return Point.of(horizontalOffset, verticalOffset).getMagnitudeSq() <= this.maxDistanceSquared;
  }
}

export default Distance;
