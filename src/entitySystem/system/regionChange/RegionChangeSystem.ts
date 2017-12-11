import {MovableEntity, Region} from '../../alias';
import Entity from '../../Entity';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

interface RegionChangeSystem<T extends MovableEntity, U extends Entity> {
  update(
      entityFinder: EntityFinder<U>,
      trackee: T,
      enteringRegions: Array<Region<U>>,
      exitingRegions: Array<Region<U>>): void;
}

export default RegionChangeSystem;
