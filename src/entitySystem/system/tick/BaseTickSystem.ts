import TickSystem from './TickSystem';
import {MovableEntity, Region} from '../../alias';
import Entity from '../../Entity';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

abstract class BaseTickSystem<T extends MovableEntity, U extends Entity>
    implements TickSystem<T, U> {
  onTick(entityFinder: EntityFinder<U>, trackee: T, currentRegions: Array<Region<U>>): void {
    for (let currentRegion of currentRegions) {
      this.onTickRegion(entityFinder, trackee, currentRegion);
    }
  }

  protected abstract onTickRegion(
      entityFinder: EntityFinder<U>,
      trackee: T,
      currentRegion: Region<U>): void;
}

export default BaseTickSystem;
