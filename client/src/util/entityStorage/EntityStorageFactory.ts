import {DisplayableRegion, StationaryEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import EntityStorage from './EntityStorage';

interface EntityStorageFactory {
  createChunkEntityStorage<T extends StationaryEntity>(chunksCount?: number): EntityStorage<T, DisplayableRegion<T>>;

  createGlobalEntityStorage<T extends Entity>(): EntityStorage<T>;

  createQuadtreeEntityStorage<T extends StationaryEntity>(maxValuesCount?: number): EntityStorage<T, T>;
}

export default EntityStorageFactory;
