import EntityFinder, {EntityMovedEvent} from '../EntityFinder';
import Point from '../../syntax/Point';
import {toWorldCoordinate2d, toWorldCoordinateOffset2d, validateRadius} from '../../../law';
import PhysicalConstants from '../../../PhysicalConstants';
import Entity from '../../../entitySystem/Entity';
import Pair from '../../syntax/Pair';

class GlobalEntityFinder<T extends Entity> implements EntityFinder<T> {
  constructor(
      private entities: T[],
      readonly entityRegistered: Phaser.Signal<T>,
      readonly entityMoved: Phaser.Signal<EntityMovedEvent<T>>) {
  }

  findClosetEntityTo(coordinates: Point): T | null {
    return this.getEntityDistancesSquared(coordinates)
        .reduce((acc: Pair<T | null, number>, pair: Pair<T | null, number>) => {
          if (pair.second < acc.second) {
            return pair;
          }
          return acc;
        }, Pair.of(null, 0))
        .first;
  }

  listAround(coordinates: Point, radius: number): Iterable<T> {
    validateRadius(radius);

    let radiusSquared = radius ** 2;
    return this.getEntityDistancesSquared(coordinates)
        .filter(pair => pair.second < radiusSquared)
        .map(pair => pair.first);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.entities[Symbol.iterator]();
  }

  private getEntityDistancesSquared(anchorCoordinates: Point) {
    anchorCoordinates = toWorldCoordinate2d(anchorCoordinates, PhysicalConstants.WORLD_SIZE);
    return this.entities.map(entity => {
      let offset = toWorldCoordinateOffset2d(
          entity.coordinates,
          anchorCoordinates,
          PhysicalConstants.WORLD_SIZE);
      return Pair.of(entity, offset.dot(offset));
    });
  }
}

export default GlobalEntityFinder;
