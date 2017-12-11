import EntityFinder from '../util/entityFinder/EntityFinder';
import PhysicalConstants from '../PhysicalConstants';
import Animated from './Animated';
import {MovableEntity, PartialEntity, Region, StationaryEntity} from '../entitySystem/alias';
import RegionChangeSystem from '../entitySystem/system/regionChange/RegionChangeSystem';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import Entity from '../entitySystem/Entity';

type TrackeeType = MovableEntity;
type EntityType = StationaryEntity;

/**
 * Tracks an animated entity and triggers callbacks whenever the entity moves from one region to
 * another.
 * The entity must be animated because otherwise it never updates, and thus requires no tracking.
 */
class EntityTracker<T extends TrackeeType = TrackeeType, U extends EntityType = EntityType>
    implements Animated {
  private currentCoordinate: Phaser.Point;

  constructor(
      private trackee: T,
      private samplingRadius: number,
      private trackingRecords: Map<EntityFinder<U>, TrackingRecord<T, U>>) {
    this.currentCoordinate = trackee.coordinates;
    EntityTracker.validateSamplingRadius(samplingRadius);
  }

  static newBuilder<T extends TrackeeType, U extends EntityType>(
      trackee: T, samplingRadius: number): EntityTrackerBuilder<T, U> {
    return new EntityTrackerBuilder(trackee, samplingRadius);
  }

  private static validateSamplingRadius(radius: number) {
    if (!(radius >= 0 && radius * 2 <= PhysicalConstants.WORLD_SIZE)) {
      throw new TypeError(`Invalid sampling radius: '${radius}'`);
    }
  }

  updateSamplingRadius(samplingRadius: number) {
    EntityTracker.validateSamplingRadius(samplingRadius);

    if (samplingRadius === this.samplingRadius) {
      return;
    }

    this.samplingRadius = samplingRadius;

    this.trackingRecords.forEach(trackingRecord => {
      trackingRecord.update(this.trackee, this.currentCoordinate, this.samplingRadius);
    });
  }

  tick(): void {
    let nextCoordinate = this.trackee.coordinates;
    this.trackingRecords.forEach(trackingRecord => {
      if (trackingRecord.canUpdate(this.currentCoordinate, nextCoordinate)) {
        trackingRecord.update(this.trackee, nextCoordinate, this.samplingRadius);
      }

      trackingRecord.tick(this.trackee);
    });

    this.currentCoordinate = nextCoordinate;
  }

  getCurrentRegions<V extends U>(entityFinder: EntityFinder<V>): Iterable<Region<V>> {
    let trackingRecord = this.trackingRecords.get(entityFinder);

    if (trackingRecord === undefined) {
      throw new TypeError('EntityFinder is not tracked');
    }

    return trackingRecord.getCurrentRegions() as Iterable<Region<V>>;
  }

  isTracking(entityFinder: EntityFinder<U>) {
    return this.trackingRecords.get(entityFinder) !== undefined;
  }
}

export default EntityTracker;

export class EntityTrackerBuilder<T extends TrackeeType, U extends EntityType> {
  private entityFinders: Map<EntityFinder<U>, TrackingRecord<T, U>>;

  constructor(private trackee: T, private samplingRadius: number) {
    this.entityFinders = new Map();
  }

  trackOnRegionChange(
      entityFinder: EntityFinder<U>, system: RegionChangeSystem<T, PartialEntity<U>>) {
    let binder = this.getBinder(entityFinder);
    binder.addRegionChangeSystem(system);

    return this;
  }

  trackOnTick(entityFinder: EntityFinder<U>, system: TickSystem<T, PartialEntity<U>>) {
    let binder = this.getBinder(entityFinder);
    binder.addTickSystem(system);

    return this;
  }

  build() {
    if (this.entityFinders.size === 0) {
      throw new TypeError('No entity managers are tracked');
    }
    return new EntityTracker(this.trackee, this.samplingRadius, this.entityFinders);
  }

  private getBinder(entityFinder: EntityFinder<any>) {
    let binder = this.entityFinders.get(entityFinder);
    if (binder === undefined) {
      binder = new TrackingRecord(entityFinder);
      this.entityFinders.set(entityFinder, binder);
    }
    return binder;
  }
}

export class TrackingRecord<T extends TrackeeType, U extends EntityType> {
  private regionChangeSystems: Array<RegionChangeSystem<T, Entity>>;
  private tickSystems: Array<TickSystem<T, Entity>>;
  private currentRegions: Set<Region<U>>;

  constructor(private entityFinder: EntityFinder<U>) {
    this.regionChangeSystems = [];
    this.tickSystems = [];
    this.currentRegions = new Set();
  }

  static leftOuterJoin<T>(set: Iterable<T>, other: Set<T>): T[] {
    let difference = [];
    for (let element of set) {
      if (!other.has(element)) {
        difference.push(element);
      }
    }
    return difference;
  }

  addRegionChangeSystem(system: RegionChangeSystem<T, PartialEntity<U>>) {
    this.regionChangeSystems.push(system);
    return this;
  }

  addTickSystem(system: TickSystem<T, PartialEntity<U>>) {
    this.tickSystems.push(system);
    return this;
  }

  getCurrentRegions(): Iterable<Region<U>> {
    return this.currentRegions;
  }

  canUpdate(currentCoordinate: Phaser.Point, nextCoordinate: Phaser.Point) {
    return this.entityFinder.isInSameContainer(currentCoordinate, nextCoordinate);
  }

  update(trackee: T, nextCoordinate: Phaser.Point, samplingRadius: number) {
    let nextRegions = this.entityFinder.listAround(nextCoordinate, samplingRadius);
    let nextRegionsSet = new Set(nextRegions);
    let enteringRegions = TrackingRecord.leftOuterJoin(nextRegionsSet, this.currentRegions);
    let exitingRegions = TrackingRecord.leftOuterJoin(this.currentRegions, nextRegionsSet);

    for (let system of this.regionChangeSystems) {
      system.update(this.entityFinder, trackee, enteringRegions.slice(), exitingRegions.slice());
    }

    this.currentRegions = nextRegionsSet;
  }

  tick(trackee: T) {
    for (let system of this.tickSystems) {
      system.onTick(this.entityFinder, trackee, this.getCurrentRegions());
    }
  }
}
