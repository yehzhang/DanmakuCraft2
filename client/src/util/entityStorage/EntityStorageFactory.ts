import {StationaryEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import EntityStorage from './EntityStorage';

interface EntityStorageFactory {
  createGlobalEntityStorage<T extends Entity>(): EntityStorage<T>;

  createQuadtreeEntityStorage<T extends StationaryEntity>(maxValuesCount?: number): EntityStorage<T, T>;
}

export default EntityStorageFactory;
