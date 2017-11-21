import {AnimatedEntity, SuperposedEntity} from '../entity/entity';
import {Animated} from '../law';
import EntityManager, {Region} from '../entity/EntityManager';
import EntityTrackerListener from './RegionChangeEventListener';
import {PhysicalConstants} from '../Universe';

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
      if (!trackingRecord.canUpdate(this.currentCoordinate, nextCoordinate)) {
        return;
      }
      trackingRecord.update(this.trackee, nextCoordinate, this.samplingRadius);
    });

    this.currentCoordinate = nextCoordinate;
  }
}

class EntityTrackerBuilder<T extends AnimatedEntity> {
  private entityManagers: Map<EntityManager, TrackingBinder<T, SuperposedEntity>>;

  constructor(private trackee: T, private samplingRadius: number) {
  }

  registerTracking<E extends SuperposedEntity>(
      entityManager: EntityManager<E>, listener: EntityTrackerListener<any, T, E>) {
    if (!this.entityManagers.has(entityManager)) {
      this.entityManagers.set(entityManager, new TrackingBinder());
    }

    let binder = this.entityManagers.get(entityManager) as TrackingBinder<T, E>;
    binder.addListener(listener);

    return this;
  }

  build() {
    let trackingRecords = [];
    for (let [entityManager, trackingBinder] of this.entityManagers) {
      let trackingRecord = new TrackingRecord(entityManager, trackingBinder);
      trackingRecords.push(trackingRecord);
    }

    return new EntityTracker(this.trackee, this.samplingRadius, trackingRecords);
  }
}

class TrackingRecord<T extends AnimatedEntity, E extends SuperposedEntity> {
  constructor(private entityManager: EntityManager<E>, private binder: TrackingBinder<T, E>) {
  }

  canUpdate(currentCoordinate: Phaser.Point, nextCoordinate: Phaser.Point) {
    return this.entityManager.isInSameRegion(currentCoordinate, nextCoordinate);
  }

  update(trackee: T, nextCoordinate: Phaser.Point, samplingRadius: number) {
    this.binder.update(this.entityManager, trackee, nextCoordinate, samplingRadius);
  }
}

class TrackingBinder<T extends AnimatedEntity, E extends SuperposedEntity> {
  private listeners: Array<EntityTrackerListener<any, T, E>>;
  private currentRegions: Set<Region<E>>;

  constructor() {
    this.listeners = [];
    this.currentRegions = new Set();
  }

  addListener(listener: EntityTrackerListener<any, T, E>) {
    this.listeners.push(listener);
  }

  update(
      entityManager: EntityManager<E>,
      trackee: T,
      nextCoordinate: Phaser.Point,
      samplingRadius: number) {
    let nextRegions = entityManager.listAround(nextCoordinate, samplingRadius);
    let nextRegionsSet = new Set(nextRegions);
    let enteringRegions = TrackingBinder.leftOuterJoin(nextRegionsSet, this.currentRegions);
    let exitingRegions = TrackingBinder.leftOuterJoin(this.currentRegions, nextRegionsSet);

    for (let listener of this.listeners) {
      listener.update(entityManager, trackee, enteringRegions.slice(), exitingRegions.slice());
    }

    this.currentRegions = nextRegionsSet;
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
