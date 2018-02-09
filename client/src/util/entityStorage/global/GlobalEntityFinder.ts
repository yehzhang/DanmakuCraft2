import EntityFinder, {StateChanged} from '../EntityFinder';
import Point from '../../syntax/Point';
import Distance from '../../math/Distance';
import {asSequence} from 'sequency';
import Iterator from '../../syntax/Iterator';
import {Phaser} from '../../alias/phaser';
import Entity from '../../../entitySystem/Entity';
import Display from '../../../entitySystem/component/Display';

class GlobalEntityFinder<T extends Entity> implements EntityFinder<T> {
  constructor(
      private entities: Set<T>,
      readonly onStateChanged: Phaser.Signal<StateChanged<T>>) {
  }

  private static isDisplay(entity: any): entity is Display {
    return entity.hasOwnProperty('display');
  }

  listAround(coordinates: Point, radius: number): Iterable<T> {
    if (radius === 0) {
      return [];
    }

    let distance = new Distance(radius);
    return asSequence(this.entities)
        .filter(entity => {
          if (GlobalEntityFinder.isDisplay(entity)) {
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

export default GlobalEntityFinder;
