import EntityFinder, {ExistenceUpdatedEvent} from '../EntityFinder';
import Point from '../../syntax/Point';
import Distance from '../../math/Distance';
import {asSequence} from 'sequency';
import Iterator from '../../syntax/Iterator';
import {Phaser} from '../../alias/phaser';
import {DisplayableEntity} from '../../../entitySystem/alias';

class GlobalEntityFinder<T extends DisplayableEntity> implements EntityFinder<T> {
  constructor(
      private entities: Set<T>,
      readonly entityExistenceUpdated: Phaser.Signal<ExistenceUpdatedEvent<T>>) {
  }

  listAround(coordinates: Point, radius: number): Iterable<T> {
    if (radius === 0) {
      return [];
    }

    let distance = new Distance(radius);
    return asSequence(this.entities)
        .filter(entity => distance.isDisplayClose(entity, coordinates))
        .asIterable();
  }

  [Symbol.iterator]() {
    return Iterator.of(this.entities);
  }
}

export default GlobalEntityFinder;
