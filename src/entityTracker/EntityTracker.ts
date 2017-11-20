import {AnimatedEntity} from '../entity/entity';
import {EventDispatcher, UnaryEvent} from '../dispatcher';
import {Animated, Container} from '../law';
import EntityManager from '../entity/EntityManager';

export class RegionChangeEvent<E extends AnimatedEntity> extends UnaryEvent<RegionChangeData<E>> {
  static readonly type = 'regionChange';

  constructor(regionChangeData: RegionChangeData<E>) {
    super(RegionChangeEvent.type, regionChangeData);
  }
}

export class RegionChangeData<E extends AnimatedEntity> {
  constructor(
      readonly trackee: E,
      readonly entityManager: EntityManager,
      readonly entityManagerIndex: number) {
  }
}

/**
 * Tracks an entity and dispatches an {@link RegionChangeEvent} whenever the entity moves from one
 * region to another.
 */
export default class EntityTracker<E extends AnimatedEntity>
    extends EventDispatcher<RegionChangeEvent<E>> implements Animated, Container<EntityManager> {
  static readonly REGION_CHANGE = RegionChangeEvent.type;

  private entityManagers: EntityManager[];
  private previousCoordinate: Phaser.Point;

  constructor(private trackee: E, entityManagers: EntityManager[]) {
    super();

    this.entityManagers = entityManagers.slice();
    this.previousCoordinate = trackee.getCoordinate();
  }

  getTrackee(): E {
    return this.trackee;
  }

  forEach(f: (value: EntityManager, index: number) => void, thisArg?: any) {
    return this.entityManagers.forEach(f, thisArg);
  }

  tick(): void {
    let coordinate = this.trackee.getCoordinate();
    this.entityManagers.forEach((entityManager, entityManagerIndex) => {
      if (entityManager.isInSameRegion(coordinate, this.previousCoordinate)) {
        return;
      }

      let regionChangeData = new RegionChangeData(this.trackee, entityManager, entityManagerIndex);
      this.dispatchEvent(new RegionChangeEvent(regionChangeData));
    });

    this.previousCoordinate = coordinate;
  }
}
