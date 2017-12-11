import {MovableEntity, Region} from '../../alias';
import Entity from '../../Entity';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

interface TickSystem<T extends MovableEntity, U extends Entity> {
  onTick(entityFinder: EntityFinder<U>, trackee: T, currentRegions: Iterable<Region<U>>): void;
}

export default TickSystem;
