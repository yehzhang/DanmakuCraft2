import {asSequence} from 'sequency';
import Display from '../../entitySystem/component/Display';
import Entity from '../../entitySystem/Entity';
import {Phaser} from '../alias/phaser';
import Distance from '../math/Distance';
import Iterator from '../syntax/Iterator';
import Point from '../syntax/Point';
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
      console.error('Entity was not registered', entity);
      return;
    }

    this.onEntitiesDeregistered.dispatch([entity]);
  }

  [Symbol.iterator](): Iterator<T> {
    return Iterator.of(this.entities);
  }
}

function isDisplay(entity: any): entity is Display {
  return entity.hasOwnProperty('display');
}

export default GlobalEntityStorage;
