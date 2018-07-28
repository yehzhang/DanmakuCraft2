import {DisplayableEntity} from '../../entitySystem/alias';
import {toWorldCoordinateOffset2d, toWorldIntervalOffset, validateRadius} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import Point from '../syntax/Point';

class Distance {
  private readonly maxDistanceSquared: number;

  constructor(maxDistanceToBeClose: number) {
    validateRadius(maxDistanceToBeClose);
    this.maxDistanceSquared = maxDistanceToBeClose ** 2;
  }

  /**
   * @return Not an exact distance, but a comparable distance.
   */
  static roughlyOf(coordinates: Point, other: Point) {
    return squaredOf(coordinates, other);
  }

  static of(coordinates: Point, other: Point) {
    const distanceSquared = squaredOf(coordinates, other);
    return Math.sqrt(distanceSquared);
  }

  isClose(coordinates: Point, other: Point) {
    return squaredOf(coordinates, other) <= this.maxDistanceSquared;
  }

  isDisplayClose(entity: DisplayableEntity, other: Point) {
    const bounds = entity.getDisplayWorldBounds();
    const horizontalOffset = toWorldIntervalOffset(
        bounds.left,
        bounds.right,
        other.x,
        PhysicalConstants.WORLD_SIZE);
    const verticalOffset = toWorldIntervalOffset(
        bounds.top,
        bounds.bottom,
        other.y,
        PhysicalConstants.WORLD_SIZE);
    return Point.of(horizontalOffset, verticalOffset).getMagnitudeSq() <= this.maxDistanceSquared;
  }
}

function squaredOf(coordinates: Point, other: Point) {
  return toWorldCoordinateOffset2d(coordinates, other, PhysicalConstants.WORLD_SIZE)
      .getMagnitudeSq();
}

export default Distance;
