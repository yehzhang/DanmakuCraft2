import {AnimatedEntity, SuperposedEntity} from '../entity/entity';
import {Existent} from '../law';
import EntityManager, {Region} from '../entity/EntityManager';
import EntityTrackerListener from './RegionChangeEventListener';

/**
 * Displays entities around an entity.
 */
export default class EntityProjector<
    T extends AnimatedEntity = AnimatedEntity, E extends SuperposedEntity = SuperposedEntity>
    extends EntityTrackerListener<PIXI.DisplayObjectContainer, T, E>
    implements Existent {
  private container: PIXI.DisplayObjectContainer;

  constructor() {
    super();
    this.container = new PIXI.DisplayObjectContainer();
  }

  protected makeContext(): PIXI.DisplayObjectContainer {
    let container = new PIXI.DisplayObjectContainer();
    this.container.addChild(container);
    return container;
  }

  protected onEnter(
      entityManager: EntityManager,
      trackee: T,
      regions: Array<Region<E>>,
      container: PIXI.DisplayObjectContainer): void {
    let observerCoordinate = trackee.getCoordinate();
    for (let region of regions) {
      region.decohere(observerCoordinate);

      let display = region.measure();
      container.addChild(display);
    }
  }

  protected onExit(
      entityManager: EntityManager,
      trackee: T,
      regions: Array<Region<E>>,
      container: PIXI.DisplayObjectContainer): void {
    for (let region of regions) {
      let display = region.measure();
      container.removeChild(display);

      region.cohere();
    }
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
  }
}
