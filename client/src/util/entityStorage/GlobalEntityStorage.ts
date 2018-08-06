import {asSequence} from 'sequency';
import Display from '../../entitySystem/component/Display';
import Entity from '../../entitySystem/Entity';
import {Phaser} from '../alias/phaser';
import Distance from '../math/Distance';
import {Collector} from './EntityFinder';
import EntityStorage from './EntityStorage';

class GlobalEntityStorage<T extends Entity> implements EntityStorage<T> {
  constructor(
      private readonly entities = new Set<T>(),
      readonly onEntitiesRegistered = new Phaser.Signal<ReadonlyArray<T>>(),
      readonly onEntitiesDeregistered = new Phaser.Signal<ReadonlyArray<T>>()) {
  }

  static create<T extends Entity>(): GlobalEntityStorage<T> {
    return new GlobalEntityStorage();
  }

  collectAround(coordinates: Phaser.ReadonlyPoint, radius: number, collector: Collector<T>) {
    const distance = new Distance(radius);
    for (const entity of this.entities) {
      if (isDisplay(entity)) {
        if (!distance.isDisplayClose(entity, coordinates)) {
          continue;
        }
      } else if (!distance.isClose(entity.coordinates, coordinates)) {
        continue;
      }
      collector.add(entity);
    }
  }

  register(entity: T) {
    if (this.entities.has(entity)) {
      return;
    }
    this.entities.add(entity);

    this.onEntitiesRegistered.dispatch([entity]);
  }

  registerBatch(entities: Iterable<T>) {
    const registeredEntities = asSequence(entities)
        .filter(entity => !this.entities.has(entity))
        .onEach(entity => this.entities.add(entity))
        .toArray();

    if (registeredEntities.length === 0) {
      return;
    }
    this.onEntitiesRegistered.dispatch(registeredEntities);
  }

  deregister(entity: T) {
    const isEntityDeleted = this.entities.delete(entity);
    if (!isEntityDeleted) {
      if (__DEV__) {
        console.error('Entity was not registered', entity);
      }
      return;
    }

    this.onEntitiesDeregistered.dispatch([entity]);
  }

  * [Symbol.iterator]() {
    yield* this.entities;
  }
}

function isDisplay(entity: any): entity is Display {
  return entity.hasOwnProperty('display');
}

export default GlobalEntityStorage;
