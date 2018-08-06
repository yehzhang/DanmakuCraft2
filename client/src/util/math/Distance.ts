import {DisplayableEntity} from '../../entitySystem/alias';
import {toWorldCoordinateOffset2d, toWorldIntervalOffset, validateRadius} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../alias/phaser';
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
  static roughlyOf(coordinates: Phaser.ReadonlyPoint, other: Phaser.ReadonlyPoint) {
    return squaredOf(coordinates, other);
  }

  static of(coordinates: Phaser.ReadonlyPoint, other: Phaser.ReadonlyPoint) {
    const distanceSquared = squaredOf(coordinates, other);
    return Math.sqrt(distanceSquared);
  }

  isClose(coordinates: Phaser.ReadonlyPoint, other: Phaser.ReadonlyPoint) {
    return squaredOf(coordinates, other) <= this.maxDistanceSquared;
  }

  isDisplayClose(entity: DisplayableEntity, other: Phaser.ReadonlyPoint) {
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

function squaredOf(coordinates: Phaser.ReadonlyPoint, other: Phaser.ReadonlyPoint) {
  return toWorldCoordinateOffset2d(coordinates, other, PhysicalConstants.WORLD_SIZE)
      .getMagnitudeSq();
}

export default Distance;
