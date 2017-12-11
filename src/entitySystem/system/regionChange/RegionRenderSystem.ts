import EntityRenderSystem from './EntityRenderSystem';
import {MovableEntity, Region, SuperposedEntity} from '../../alias';
import Point from '../../../util/Point';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

class RegionRenderSystem extends EntityRenderSystem<MovableEntity, SuperposedEntity> {
  private parentPosition: Point;

  constructor(
      private container: PIXI.DisplayObjectContainer, parentPosition: Point = Point.origin()) {
    super();
    this.parentPosition = parentPosition.clone();
  }

  protected onEnter(
      entityFinder: EntityFinder<SuperposedEntity>,
      trackee: MovableEntity,
      region: Region<SuperposedEntity>) {
    EntityRenderSystem.renderEntity(this.container, this.parentPosition, region);
    super.onEnter(entityFinder, trackee, region);
  }

  protected onExit(
      entityFinder: EntityFinder<SuperposedEntity>,
      trackee: MovableEntity,
      region: Region<SuperposedEntity>) {
    super.onExit(entityFinder, trackee, region);

    this.container.removeChild(region.display);
    region.releaseDisplay();
  }
}

export default RegionRenderSystem;
