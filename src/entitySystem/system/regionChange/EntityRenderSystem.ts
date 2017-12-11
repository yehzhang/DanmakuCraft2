import BaseRegionChangeSystem from './BaseRegionChangeSystem';
import {MovableEntity, Region, SuperposedEntity} from '../../alias';
import EntityFinder from '../../../util/entityFinder/EntityFinder';
import Point from '../../../util/Point';

class EntityRenderSystem<T extends MovableEntity, U extends SuperposedEntity>
    extends BaseRegionChangeSystem<T, U> {
  protected static renderEntity<U extends SuperposedEntity>(
      parentDisplay: PIXI.DisplayObjectContainer,
      parentPosition: Point,
      entity: U) {
    entity.acquireDisplay();
    entity.display.position = entity.asOffsetTo(parentPosition);

    parentDisplay.addChild(entity.display);
  }

  protected onEnter(entityFinder: EntityFinder<U>, trackee: T, region: Region<U>): void {
    for (let entity of region.container) {
      EntityRenderSystem.renderEntity(region.display, region.coordinates, entity);
    }
  }

  protected onExit(entityFinder: EntityFinder<U>, trackee: T, region: Region<U>): void {
    for (let entity of region.container) {
      entity.releaseDisplay();
    }

    // region.display.removeChildren won't work.
    for (let childDisplay of region.display.children) {
      childDisplay.parent = null as any;
    }
    region.display.children.length = 0;
  }
}

export default EntityRenderSystem;
