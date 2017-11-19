import {AnimatedEntity, Entity, EntityManager, Region} from './entity';
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
      this.onRegionChange(
          regionChangeData.entityManager,
          regionChangeData.entityManagerIndex,
          regionChangeData.trackee.getCoordinate(),
          regionChangeData.previousWorldCoordinate);
    });
  }

  onRegionChange(
      entityManager: EntityManager,
      entityManagerIndex: number,
      observerCoordinate: Phaser.Point,
      previousCoordinate: Phaser.Point) {
    let container = this.container.getChildAt(entityManagerIndex) as PIXI.DisplayObjectContainer;

    entityManager.leftOuterJoinRenderableRegions(previousCoordinate, observerCoordinate)
        .forEach(region => EntityProjector.cohereRegion(region, container));

    entityManager.leftOuterJoinRenderableRegions(observerCoordinate, previousCoordinate)
        .forEach(region => EntityProjector.decohereRegion(observerCoordinate, region, container));
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
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
