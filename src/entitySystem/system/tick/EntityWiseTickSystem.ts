import BaseTickSystem from './BaseTickSystem';
import {MovableEntity, Region} from '../../alias';
import Entity from '../../Entity';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

abstract class EntityWiseTickSystem<T extends MovableEntity, U extends Entity>
    extends BaseTickSystem<T, U> {
  protected onTickRegion(entityFinder: EntityFinder<U>, trackee: T, currentRegion: Region<U>) {
    for (let entity of currentRegion.container) {
      this.onTickEntity(entityFinder, trackee, currentRegion, entity);
    }
  }

  protected abstract onTickEntity(
      entityFinder: EntityFinder<U>,
      trackee: T,
      currentRegion: Region<U>,
      entity: U): void;
}

export default EntityWiseTickSystem;
