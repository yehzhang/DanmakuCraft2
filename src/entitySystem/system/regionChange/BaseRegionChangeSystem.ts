import {MovableEntity, Region} from '../../alias';
import RegionChangeSystem from './RegionChangeSystem';
import Entity from '../../Entity';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

/**
 * Provides better granularity of update.
 */
abstract class BaseRegionChangeSystem<T extends MovableEntity, U extends Entity>
    implements RegionChangeSystem<T, U> {
  update(
      entityFinder: EntityFinder<U>,
      trackee: T,
      enteringRegions: Array<Region<U>>,
      exitingRegions: Array<Region<U>>) {
    for (let region of enteringRegions) {
      this.onEnter(entityFinder, trackee, region);
    }

    for (let region of exitingRegions) {
      this.onExit(entityFinder, trackee, region);
    }

    if (enteringRegions.length > 0 || exitingRegions.length > 0) {
      this.onUpdate(entityFinder, trackee);
    }
  }

  /**
   * Does everything that this digester is intended for when {@param trackee} enters a
   * {@param region} of {@param entityFinder}.
   */
  protected onEnter(entityFinder: EntityFinder<U>, trackee: T, region: Region<U>) {
  }

  /**
   * Does everything that this digester is intended for when {@param trackee} exits a
   * {@param region} of {@param entityFinder}.
   */
  protected onExit(entityFinder: EntityFinder<U>, trackee: T, region: Region<U>) {
  }

  /**
   * Called when {@link onEnter} and/or {@link onExit} is called.
   */
  protected onUpdate(entityFinder: EntityFinder<U>, trackee: T) {
  }
}

export default BaseRegionChangeSystem;
