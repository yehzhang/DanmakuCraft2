import EntityStorage from './EntityStorage';
import {Region, StationaryEntity} from '../../entitySystem/alias';

interface EntityStorageFactory {
  createChunkEntityStorage<T extends StationaryEntity>(
      chunksCount: number): EntityStorage<T, Region<T>>;

  createGlobalEntityStorage<T>(): EntityStorage<T>;
}

export default EntityStorageFactory;
