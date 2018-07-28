import {asSequence} from 'sequency';
import Display from '../../../entitySystem/component/Display';
import Entity from '../../../entitySystem/Entity';
import {Phaser} from '../../alias/phaser';
import Distance from '../../math/Distance';
import Iterator from '../../syntax/Iterator';
import Point from '../../syntax/Point';
import EntityFinder, {StateChanged} from '../EntityFinder';

class GlobalEntityFinder<T extends Entity> implements EntityFinder<T> {
  constructor(
      private readonly entities: Set<T>,
      readonly onStateChanged: Phaser.Signal<StateChanged<T>>) {
  }

  listAround(coordinates: Point, radius: number): Iterable<T> {
    if (radius === 0) {
      return [];
    }

    const distance = new Distance(radius);
    return asSequence(this.entities)
        .filter(entity => {
          if (isDisplay(entity)) {
            return distance.isDisplayClose(entity, coordinates);
          }
          return distance.isClose(entity.coordinates, coordinates);
        })
        .asIterable();
  }

  [Symbol.iterator]() {
    return Iterator.of(this.entities);
  }
}

function isDisplay(entity: any): entity is Display {
  return entity.hasOwnProperty('display');
}

export default GlobalEntityFinder;
