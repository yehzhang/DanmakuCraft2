import EntityFinder, {EntityExistenceUpdatedEvent} from '../EntityFinder';
import Point from '../../syntax/Point';
import Entity from '../../../entitySystem/Entity';
import Distance from '../../math/Distance';
import {asSequence} from 'sequency';
import Iterator from '../../syntax/Iterator';

class GlobalEntityFinder<T extends Entity> implements EntityFinder<T> {
  constructor(
      private entities: Set<T>,
      readonly entityExistenceUpdated: Phaser.Signal<EntityExistenceUpdatedEvent<T>>) {
  }

  findClosestEntityTo(coordinates: Point): T | null {
    return asSequence(this.entities)
        .minBy(entity => Distance.roughlyOf(entity.coordinates, coordinates));
  }

  listAround(coordinates: Point, radius: number): Iterable<T> {
    let distance = new Distance(radius);
    return asSequence(this.entities)
        .filter(entity => distance.isClose(entity.coordinates, coordinates))
        .asIterable();
  }

  [Symbol.iterator]() {
    return Iterator.of(this.entities);
  }
}

export default GlobalEntityFinder;
