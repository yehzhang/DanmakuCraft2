import EntityStorageFactory from './EntityStorageFactory';
import Point from '../syntax/Point';
import EntityFactory from '../../entitySystem/EntityFactory';
import {DisplayableRegion, Region, StationaryEntity} from '../../entitySystem/alias';
import ChunkEntityRegister from './chunk/ChunkEntityRegister';
import Chunks from './chunk/Chunks';
import ChunkEntityFinder from './chunk/ChunkEntityFinder';
import EntityStorageImpl from './EntityStorageImpl';
import PhysicalConstants from '../../PhysicalConstants';
import GlobalEntityRegister from './global/GlobalEntityRegister';
import GlobalEntityFinder from './global/GlobalEntityFinder';
import {StateChanged} from './EntityFinder';
import {Phaser} from '../alias/phaser';
import Entity from '../../entitySystem/Entity';
import QuadTreeEntityRegister from './quadtree/QuadtreeEntityRegister';
import QuadTreeEntityFinder from './quadtree/QuadtreeEntityFinder';
import Quadtree from './quadtree/Quadtree';

class EntityStorageFactoryImpl implements EntityStorageFactory {
  constructor(private entityFactory: EntityFactory) {
  }

  createChunkEntityStorage<T extends StationaryEntity>(
      chunksCount: number = PhysicalConstants.COMMENT_CHUNKS_COUNT) {
    chunksCount = Math.floor(chunksCount);
    if (!(chunksCount > 0)) {
      throw new TypeError('Invalid chunks count');
    }

    const chunks = this.createChunks<T>(chunksCount);
    const onStateChanged = new Phaser.Signal<StateChanged<DisplayableRegion<T>>>();
    const entityRegister = new ChunkEntityRegister<T>(chunks, onStateChanged, this.entityFactory);

    const entityFinder = new ChunkEntityFinder(chunks, onStateChanged);

    return new EntityStorageImpl(entityRegister, entityFinder);
  }

  createGlobalEntityStorage<T extends Entity>() {
    const entities: Set<T> = new Set();
    const onStateChanged = new Phaser.Signal<StateChanged<T>>();
    const entityRegister = new GlobalEntityRegister(entities, onStateChanged);

    const entityFinder = new GlobalEntityFinder(entities, onStateChanged);

    return new EntityStorageImpl(entityRegister, entityFinder);
  }

  createChunks<T>(chunksCount: number = PhysicalConstants.COMMENT_CHUNKS_COUNT): Chunks<DisplayableRegion<T>> {
    const chunkSize = PhysicalConstants.WORLD_SIZE / chunksCount;

    const chunks = [];
    const coordinates = Point.origin();
    for (let y = 0; y < chunksCount; y++) {
      coordinates.y = y * chunkSize;
      let chunksRow = [];

      for (let x = 0; x < chunksCount; x++) {
        coordinates.x = x * chunkSize;
        chunksRow.push(this.entityFactory.createRegion<T>(coordinates));
      }

      chunks.push(chunksRow);
    }

    return new Chunks(chunks, chunkSize);
  }

  createQuadtreeEntityStorage<T extends StationaryEntity>(
      maxValuesCount: number = PhysicalConstants.QUADTREE_MAX_VALUES_COUNT,
      maxDepth: number = PhysicalConstants.QUADTREE_MAX_DEPTH) {
    const tree = Quadtree.empty<T>(maxValuesCount, maxDepth);
    const onStateChanged = new Phaser.Signal<StateChanged<Region<T>>>();
    const entityRegister = new QuadTreeEntityRegister(tree, onStateChanged);

    const entityFinder = new QuadTreeEntityFinder(tree, onStateChanged);

    return new EntityStorageImpl(entityRegister, entityFinder);
  }
}

export default EntityStorageFactoryImpl;
