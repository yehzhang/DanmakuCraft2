import {MovableEntity, Region} from '../../alias';
import Entity from '../../Entity';
import BaseRegionChangeSystem from './BaseRegionChangeSystem';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

abstract class EntitySystem<T extends MovableEntity, U extends Entity>
    extends BaseRegionChangeSystem<T, U> {
  protected onEnter(entityFinder: EntityFinder<U>, trackee: T, region: Region<U>) {
    for (let entity of region.container) {
      this.onEnterEntity(entityFinder, trackee, entity);
    }
  }

  protected onExit(entityFinder: EntityFinder<U>, trackee: T, region: Region<U>) {
    for (let entity of region.container) {
      this.onExitEntity(entityFinder, trackee, entity);
    }
  }

  protected abstract onEnterEntity(entityFinder: EntityFinder<U>, trackee: T, entity: U): void;

  protected abstract onExitEntity(entityFinder: EntityFinder<U>, trackee: T, entity: U): void;
}

export default EntitySystem;
