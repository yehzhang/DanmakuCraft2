import EntityStorageFactory from './EntityStorageFactory';
import Point from '../Point';
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

class EntityStorageFactoryImpl implements EntityStorageFactory {
  constructor(private entityFactory: EntityFactory) {
  }

  createChunkEntityStorage<T extends StationaryEntity>(
      chunksCount: number): EntityStorage<T, Region<T>> {
    chunksCount = Math.floor(chunksCount);
    if (!(chunksCount > 0)) {
      throw new TypeError('Invalid chunks count');
    }

    let chunkSize = PhysicalConstants.WORLD_SIZE / chunksCount;
    let regions = this.createRegions<T>(chunksCount, chunkSize);
    let chunks = new Chunks(regions, chunkSize);

    let entityRegistered = new Phaser.Signal<Region<T>>();
    let entityRegister = new ChunkEntityRegister<T>(chunks, entityRegistered, this.entityFactory);

    let entityFinder = new ChunkEntityFinder(chunks, entityRegistered, new Phaser.Signal());

    return new EntityStorageImpl(entityRegister, entityFinder);
  }

  createGlobalEntityStorage<T extends Entity>(): EntityStorage<T> {
    let entities: T[] = [];
    let entityRegistered = new Phaser.Signal<T>();
    let entityRegister = new GlobalEntityRegister(entities, entityRegistered);

    let entityFinder = new GlobalEntityFinder(entities, entityRegistered, new Phaser.Signal());

    return new EntityStorageImpl(entityRegister, entityFinder);
  }

  private createRegions<T>(chunksCount: number, chunkSize: number): Array<Array<Region<T>>> {
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

    return chunks;
  }
}

export default EntityStorageFactoryImpl;
