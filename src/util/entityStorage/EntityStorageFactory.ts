import EntityStorage from './EntityStorage';
import {Region, StationaryEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';

interface EntityStorageFactory {
  createChunkEntityStorage<T extends StationaryEntity>(
      chunksCount: number): EntityStorage<T, Region<T>>;

  createGlobalEntityStorage<T extends Entity>(): EntityStorage<T>;
}

export default EntityStorageFactory;
