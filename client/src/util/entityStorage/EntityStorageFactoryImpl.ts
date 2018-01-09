import EntityStorageFactory from './EntityStorageFactory';
import Point from '../syntax/Point';
import EntityFactory from '../../entitySystem/EntityFactory';
import {Region, StationaryEntity} from '../../entitySystem/alias';
import EntityStorage from './EntityStorage';
import ChunkEntityRegister from './chunk/ChunkEntityRegister';
import Chunks from './chunk/Chunks';
import ChunkEntityFinder from './chunk/ChunkEntityFinder';
import EntityStorageImpl from './EntityStorageImpl';
import PhysicalConstants from '../../PhysicalConstants';
import GlobalEntityRegister from './global/GlobalEntityRegister';
import GlobalEntityFinder from './global/GlobalEntityFinder';
import Entity from '../../entitySystem/Entity';
import {EntityExistenceUpdatedEvent} from './EntityFinder';
import {Phaser} from '../alias/phaser';

class EntityStorageFactoryImpl implements EntityStorageFactory {
  constructor(private entityFactory: EntityFactory) {
  }

  createChunkEntityStorage<T extends StationaryEntity>(
      chunksCount: number): EntityStorage<T, Region<T>> {
    chunksCount = Math.floor(chunksCount);
    if (!(chunksCount > 0)) {
      throw new TypeError('Invalid chunks count');
    }

    let chunks = this.createChunks<T>(chunksCount);
    let entityUpdated = new Phaser.Signal<EntityExistenceUpdatedEvent<Region<T>>>();
    let entityRegister = new ChunkEntityRegister<T>(chunks, entityUpdated, this.entityFactory);

    let entityFinder = new ChunkEntityFinder(chunks, entityUpdated);

    return new EntityStorageImpl(entityRegister, entityFinder);
  }

  createGlobalEntityStorage<T extends Entity>(): EntityStorage<T> {
    let entities: Set<T> = new Set();
    let entityUpdated = new Phaser.Signal<EntityExistenceUpdatedEvent<T>>();
    let entityRegister = new GlobalEntityRegister(entities, entityUpdated);

    let entityFinder = new GlobalEntityFinder(entities, entityUpdated);

    return new EntityStorageImpl(entityRegister, entityFinder);
  }

  createChunks<T>(chunksCount: number): Chunks<Region<T>> {
    let chunkSize = PhysicalConstants.WORLD_SIZE / chunksCount;

    let chunks = [];
    let coordinates = Point.origin();
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
}

export default EntityStorageFactoryImpl;
