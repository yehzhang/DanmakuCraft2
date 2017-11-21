import {AnimatedEntity, SuperposedEntity} from '../../entity/entity';
import {Animated} from '../../law';
import EntityManager, {Region} from '../../entity/EntityManager';
import RegionChangeListener from './RegionChangeListener';
import {PhysicalConstants} from '../../Universe';
import TickListener from './TickListener';

/**
 * Tracks an animated entity and triggers callbacks whenever the entity moves from one region to
 * another.
 * The entity must be animated because otherwise it never updates, and thus requires no tracking.
 */
export default class EntityTracker<T extends AnimatedEntity = AnimatedEntity> implements Animated {
  private currentCoordinate: Phaser.Point;
  private samplingRadius: number;

  constructor(
      private trackee: T,
      samplingRadius: number,
      private trackingRecords: Array<TrackingRecord<T, SuperposedEntity>>) {
    this.currentCoordinate = trackee.getCoordinate();
    this.updateSamplingRadius(samplingRadius);
  }

  static newBuilder<T extends AnimatedEntity>(trackee: T, samplingRadius: number) {
    return new EntityTrackerBuilder(trackee, samplingRadius);
  }

  updateSamplingRadius(samplingRadius: number) {
    if (!(samplingRadius >= 0 || samplingRadius * 2 <= PhysicalConstants.WORLD_SIZE)) {
      throw new Error(`Invalid sampling radius: '${samplingRadius}'`);
    }

    if (samplingRadius === this.samplingRadius) {
      return;
    }

    this.samplingRadius = samplingRadius;

    this.trackingRecords.forEach(trackingRecord => {
      trackingRecord.update(this.trackee, this.currentCoordinate, this.samplingRadius);
    });
  }

  tick(): void {
    let nextCoordinate = this.trackee.getCoordinate();
    this.trackingRecords.forEach(trackingRecord => {
      if (trackingRecord.canUpdate(this.currentCoordinate, nextCoordinate)) {
        trackingRecord.update(this.trackee, nextCoordinate, this.samplingRadius);
      }

      trackingRecord.tick(this.trackee);
    });

    this.currentCoordinate = nextCoordinate;
  }

  getCurrentRegions<E extends SuperposedEntity>(entityManager: EntityManager<E>): Array<Region<E>> {
    for (let record of this.trackingRecords) {
      if (record.entityManager === entityManager) {
        return record.getCurrentRegions() as Array<Region<E>>;
      }
    }

    throw new Error('EntityManager is not tracked');
  }
}

class EntityTrackerBuilder<T extends AnimatedEntity> {
  private entityManagers: Map<EntityManager, TrackingRecord<T, SuperposedEntity>>;

  constructor(private trackee: T, private samplingRadius: number) {
  }

  trackOnRegionChange<E extends SuperposedEntity>(
      entityManager: EntityManager<E>, listener: RegionChangeListener<T, E>) {
    let binder = this.getBinder(entityManager);
    binder.addRegionChangeListener(listener);

    return this;
  }

  trackOnTick<E extends SuperposedEntity>(
      entityManager: EntityManager<E>, listener: TickListener<T, E>) {
    let binder = this.getBinder(entityManager);
    binder.addTickListener(listener);

    return this;
  }

  build() {
    if (this.entityManagers.size === 0) {
      throw new Error('No entity managers are tracked');
    }

    let trackingRecords = [];
    for (let [_, trackingRecord] of this.entityManagers) {
      trackingRecords.push(trackingRecord);
    }

    return new EntityTracker(this.trackee, this.samplingRadius, trackingRecords);
  }

  private getBinder(entityManager: EntityManager<any>) {
    let binder = this.entityManagers.get(entityManager);
    if (binder === undefined) {
      binder = new TrackingRecord(entityManager);
      this.entityManagers.set(entityManager, binder);
    }
    return binder;
  }
}

class TrackingRecord<T extends AnimatedEntity, E extends SuperposedEntity> {
  regionChangeListeners: Array<RegionChangeListener<T, E>>;
  tickListeners: Array<TickListener<T, E>>;
  currentRegions: Set<Region<E>>;

  constructor(public entityManager: EntityManager<E>) {
    this.regionChangeListeners = [];
    this.tickListeners = [];
    this.currentRegions = new Set();
  }

  addRegionChangeListener(listener: RegionChangeListener<T, E>) {
    this.regionChangeListeners.push(listener);
  }

  addTickListener(listener: TickListener<T, E>) {
    this.tickListeners.push(listener);
  }

  getCurrentRegions() {
    return Array.from(this.currentRegions);
  }

  canUpdate(currentCoordinate: Phaser.Point, nextCoordinate: Phaser.Point) {
    return this.entityManager.isInSameRegion(currentCoordinate, nextCoordinate);
  }

  update(trackee: T, nextCoordinate: Phaser.Point, samplingRadius: number) {
    let nextRegions = this.entityManager.listAround(nextCoordinate, samplingRadius);
    let nextRegionsSet = new Set(nextRegions);
    let enteringRegions = TrackingRecord.leftOuterJoin(nextRegionsSet, this.currentRegions);
    let exitingRegions = TrackingRecord.leftOuterJoin(this.currentRegions, nextRegionsSet);

    for (let listener of this.regionChangeListeners) {
      listener.update(this.entityManager, trackee, enteringRegions.slice(), exitingRegions.slice());
    }

    this.currentRegions = nextRegionsSet;
  }

  tick(trackee: T) {
    for (let listener of this.tickListeners) {
      listener.onTick(trackee, this.getCurrentRegions());
    }
  }

  static leftOuterJoin<T>(set: Set<T>, other: Set<T>): T[] {
    let difference = [];
    for (let element of set) {
      if (!other.has(element)) {
        difference.push(element);
      }
    }
    return difference;
  }
}
