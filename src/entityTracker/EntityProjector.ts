import {AnimatedEntity, SuperposedEntity} from '../entity/entity';
import {Existent} from '../law';
import EntityManager, {Region} from '../entity/EntityManager';
import EntityTrackerListener from './RegionChangeListener';

/**
 * Displays entities around an entity.
 */
export default class EntityProjector<
    T extends AnimatedEntity = AnimatedEntity, E extends SuperposedEntity = SuperposedEntity>
    extends EntityTrackerListener<T, E>
    implements Existent {
  private container: PIXI.DisplayObjectContainer;

  constructor() {
    super();
    this.container = new PIXI.DisplayObjectContainer();
  }

  protected onEnter(entityManager: EntityManager, trackee: T, regions: Array<Region<E>>): void {
    let observerCoordinate = trackee.getCoordinate();
    for (let region of regions) {
      region.decohere(observerCoordinate);

      let display = region.measure();
      this.container.addChild(display);
    }
  }

  protected onExit(entityManager: EntityManager, trackee: T, regions: Array<Region<E>>): void {
    for (let region of regions) {
      let display = region.measure();
      this.container.removeChild(display);

      region.cohere();
    }
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
  }
}
