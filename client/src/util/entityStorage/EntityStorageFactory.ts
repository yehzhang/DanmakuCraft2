import EntityStorage from './EntityStorage';
import {DisplayableRegion, Region, StationaryEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';

interface EntityStorageFactory {
  createChunkEntityStorage<T extends StationaryEntity>(chunksCount?: number): EntityStorage<T, DisplayableRegion<T>>;

  createGlobalEntityStorage<T extends Entity>(): EntityStorage<T>;

  createQuadtreeEntityStorage<T extends StationaryEntity>(maxValuesCount?: number): EntityStorage<T, Region<T>>;
}

export default EntityStorageFactory;
