import {StationaryEntity} from '../../entitySystem/alias';
import {validateRadius} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../alias/phaser';
import Quadtree from '../dataStructures/Quadtree';
import Rectangle from '../syntax/Rectangle';
import {Collector} from './EntityFinder';
import EntityStorage from './EntityStorage';

class QuadtreeEntityStorage<T extends StationaryEntity> implements EntityStorage<T> {
  constructor(
      private readonly tree: Quadtree<T>,
      readonly onEntitiesRegistered = new Phaser.Signal<ReadonlyArray<T>>(),
      readonly onEntitiesDeregistered = new Phaser.Signal<ReadonlyArray<T>>()) {
  }

  static create<T extends StationaryEntity>(
      maxValuesCount: number = PhysicalConstants.QUADTREE_MAX_VALUES_COUNT,
      maxDepth: number = PhysicalConstants.QUADTREE_MAX_DEPTH) {
    const tree = Quadtree.create<T>(maxValuesCount, maxDepth);
    return new QuadtreeEntityStorage(tree);
  }

  collectAround(coordinates: Phaser.ReadonlyPoint, radius: number, collector: Collector<T>) {
    validateRadius(radius);

    const bounds = Rectangle.inflateFrom(coordinates, radius);
    return this.tree.collectIn(bounds, collector);
  }

  register(entity: T) {
    const registeredEntities = this.tree.add(entity);

    if (!registeredEntities.length) {
      return;
    }
    this.onEntitiesRegistered.dispatch(registeredEntities);
  }

  registerBatch(entities: Iterable<T>) {
    const registeredEntities = this.tree.addBatch(entities);

    if (!registeredEntities.length) {
      return;
    }
    this.onEntitiesRegistered.dispatch(registeredEntities);
  }

  deregister(entity: T) {
    const deregisteredEntities = this.tree.remove(entity);

    if (!deregisteredEntities.length) {
      return;
    }
    this.onEntitiesDeregistered.dispatch(deregisteredEntities);
  }

  * [Symbol.iterator]() {
    yield* this.tree;
  }
}

export default QuadtreeEntityStorage;
