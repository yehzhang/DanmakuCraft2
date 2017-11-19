import {AnimatedEntity, EntityManager} from './entity';
import {EventDispatcher, UnaryEvent} from '../dispatcher';
import {Animated, Container} from '../law';

export class RegionChangeEvent<E extends AnimatedEntity> extends UnaryEvent<RegionChangeData<E>> {
  static readonly type = 'regionChange';

  constructor(regionChangeData: RegionChangeData<E>) {
    super(RegionChangeEvent.type, regionChangeData);
  }
}

export class RegionChangeData<E extends AnimatedEntity> {
  constructor(
      readonly trackee: E,
      readonly previousWorldCoordinate: Phaser.Point,
      readonly entityManager: EntityManager,
      readonly entityManagerIndex: number) {
  }
}

export default class EntityTracker<E extends AnimatedEntity>
    extends EventDispatcher<RegionChangeEvent<E>> implements Animated, Container<EntityManager> {
  static readonly REGION_CHANGE = RegionChangeEvent.type;

  private entityManagers: EntityManager[];
  private previousCoordinate: Phaser.Point;

  constructor(
      private trackee: E,
      entityManagers: EntityManager[]) {
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

      let regionChangeData = new RegionChangeData(
          this.trackee,
          this.previousCoordinate,
          entityManager,
          entityManagerIndex);
      this.dispatchEvent(new RegionChangeEvent(regionChangeData));
    });
  }
}
