import EntityStorage from './EntityStorage';
import {DisplayableEntity, Region, StationaryEntity} from '../../entitySystem/alias';
import Display from '../../entitySystem/component/Display';

interface EntityStorageFactory {
  createChunkEntityStorage<T extends StationaryEntity & Display>(
      chunksCount: number): EntityStorage<T, Region<T>>;

  createGlobalEntityStorage<T extends DisplayableEntity>(): EntityStorage<T>;
}

export default EntityStorageFactory;
