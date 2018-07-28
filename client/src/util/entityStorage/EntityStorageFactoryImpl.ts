import {DisplayableRegion, StationaryEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import EntityFactory from '../../entitySystem/EntityFactory';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../alias/phaser';
import ChunkEntityFinder from './chunk/ChunkEntityFinder';
import ChunkEntityRegister from './chunk/ChunkEntityRegister';
import Chunks from './chunk/Chunks';
import {StateChanged} from './EntityFinder';
import EntityStorageFactory from './EntityStorageFactory';
import EntityStorageImpl from './EntityStorageImpl';
import GlobalEntityFinder from './global/GlobalEntityFinder';
import GlobalEntityRegister from './global/GlobalEntityRegister';
import Quadtree from './quadtree/Quadtree';
import QuadTreeEntityFinder from './quadtree/QuadtreeEntityFinder';
import QuadTreeEntityRegister from './quadtree/QuadtreeEntityRegister';

class EntityStorageFactoryImpl implements EntityStorageFactory {
  constructor(private entityFactory: EntityFactory) {
  }

  createChunkEntityStorage<T extends StationaryEntity>(
      chunksCount: number = PhysicalConstants.COMMENT_CHUNKS_COUNT) {
    chunksCount = Math.floor(chunksCount);
    if (!(chunksCount > 0)) {
      throw new TypeError('Invalid chunks count');
    }

    const chunks = Chunks.create<DisplayableRegion<T>>(
        point => this.entityFactory.createRegion(point), chunksCount);
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

  createQuadtreeEntityStorage<T extends StationaryEntity>(
      maxValuesCount: number = PhysicalConstants.QUADTREE_MAX_VALUES_COUNT,
      maxDepth: number = PhysicalConstants.QUADTREE_MAX_DEPTH) {
    const tree = Quadtree.empty<T>(maxValuesCount, maxDepth);
    const onStateChanged = new Phaser.Signal<StateChanged<T>>();
    const entityRegister = new QuadTreeEntityRegister(tree, onStateChanged);

    const entityFinder = new QuadTreeEntityFinder(tree, onStateChanged);

    return new EntityStorageImpl(entityRegister, entityFinder);
  }
}

export default EntityStorageFactoryImpl;
