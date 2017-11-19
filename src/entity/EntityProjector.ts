import {AnimatedEntity, Entity, Region} from './entity';
import {Existent} from '../law';
import EntityTracker from './EntityTracker';

/**
 * Displays entities.
 */
export default class EntityProjector<E extends AnimatedEntity> implements Existent {
  private container: PIXI.DisplayObjectContainer;

  constructor(private entityTracker: EntityTracker<E>) {
    this.container = new PIXI.DisplayObjectContainer();

    let observerCoordinate = entityTracker.getTrackee().getCoordinate();
    entityTracker.forEach(entityManager => {
      let container = new PIXI.DisplayObjectContainer();
      this.container.addChild(container);

      entityManager.listRenderableRegions(observerCoordinate)
          .forEach(region => EntityProjector.decohereRegion(observerCoordinate, region, container));
    });

    entityTracker.addEventListener(EntityTracker.REGION_CHANGE, event => {
      let regionChangeData = event.getDetail();
      let container = this.container.getChildAt(
          regionChangeData.entityManagerIndex) as PIXI.DisplayObjectContainer;
      EntityProjector.onRegionChange(
          regionChangeData.trackee.getCoordinate(),
          container,
          regionChangeData.leavingRegions,
          regionChangeData.enteringRegions);
    });
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
  }

  private static onRegionChange(
      observerCoordinate: Phaser.Point,
      container: PIXI.DisplayObjectContainer,
      leavingRegions: Region[],
      enteringRegions: Region[]) {
    for (let region of leavingRegions) {
      EntityProjector.cohereRegion(region, container);
    }
    for (let region of enteringRegions) {
      EntityProjector.decohereRegion(observerCoordinate, region, container);
    }
  }

  private static decohereRegion(
      observerCoordinate: Phaser.Point,
      region: Region<Entity>,
      container: PIXI.DisplayObjectContainer) {
    region.decohere(observerCoordinate);

    let display = region.measure();
    container.addChild(display);
  }

  private static cohereRegion(region: Region<Entity>, container: PIXI.DisplayObjectContainer) {
    let display = region.measure();
    container.removeChild(display);

    region.cohere();
  }
}
