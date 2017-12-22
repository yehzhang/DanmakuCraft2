import EntityFinder from '../util/entityStorage/EntityFinder';
import {Component} from '../entitySystem/alias';
import Entity from '../entitySystem/Entity';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import EntityTrackerBuilder from './EntityTrackerBuilder';
import {ApplyClause} from './entityTrackerBuilderWrapper';
import Point from '../util/syntax/Point';
import {validateRadius} from '../law';

/**
 * Tracks an animated entity and triggers callbacks whenever the entity moves from one region to
 * another.
 * The entity must be animated because otherwise it never updates, and thus requires no tracking.
 */
class EntityTracker {
  private currentCoordinate: Point;

  constructor(
      private trackee: Entity,
      private samplingRadius: number,
      private trackingRecords: OneEntityFinderToManySystemsRecord[]) {
    this.currentCoordinate = trackee.coordinates.clone();
    validateRadius(samplingRadius);
  }

  static newBuilder(trackee: Entity, samplingRadius: number) {
    let builder = new EntityTrackerBuilder(trackee, samplingRadius, new Map());
    return new ApplyClause(builder);
  }

  updateSamplingRadius(samplingRadius: number) {
    validateRadius(samplingRadius);

    if (samplingRadius === this.samplingRadius) {
      return;
    }

    this.samplingRadius = samplingRadius;

    this.updateTrackingRecords(this.trackingRecords);
  }

  tick() {
    for (let trackingRecord of this.trackingRecords) {
      trackingRecord.tick();
    }

    let nextCoordinate = this.trackee.coordinates;
    let trackingRecords =
        this.trackingRecords.filter(trackingRecord => trackingRecord.shouldUpdate(nextCoordinate));
    this.updateTrackingRecords(trackingRecords);

    this.currentCoordinate = nextCoordinate.clone();
  }

  private updateTrackingRecords(trackingRecords: OneEntityFinderToManySystemsRecord[]) {
    let stateChangedSystems = [];
    for (let trackingRecord of trackingRecords) {
      let systems = trackingRecord.update(this.currentCoordinate, this.samplingRadius);
      stateChangedSystems.push(...systems);
    }
    for (let system of new Set(stateChangedSystems)) {
      system.finish();
    }
  }
}

export default EntityTracker;

export class EntityFinderRecord<T> {
  constructor(
      private entityFinder: EntityFinder<T>,
      private currentAnchorEntity: T | null,
      public enteringEntities: T[],
      public exitingEntities: T[],
      public currentEntities: Set<T>) {
  }

  private static leftOuterJoin<T>(set: Iterable<T>, other: Set<T>): T[] {
    let difference = [];
    for (let element of set) {
      if (!other.has(element)) {
        difference.push(element);
      }
    }
    return difference;
  }

  shouldUpdate(nextCoordinates: Point) {
    let nextAnchorEntity = this.entityFinder.findClosetEntityTo(nextCoordinates);
    return this.currentAnchorEntity !== nextAnchorEntity;
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    let nextRegionArray = this.entityFinder.listAround(nextCoordinates, samplingRadius);
    let nextEntities = new Set(nextRegionArray);
    this.enteringEntities = EntityFinderRecord.leftOuterJoin(nextEntities, this.currentEntities);
    this.exitingEntities = EntityFinderRecord.leftOuterJoin(this.currentEntities, nextEntities);
    this.currentEntities = nextEntities;

    this.currentAnchorEntity = this.entityFinder.findClosetEntityTo(nextCoordinates);
  }
}

export class OneEntityFinderToManySystemsRecord<T = Component> {
  constructor(
      private entityFinderRecord: EntityFinderRecord<T>,
      private existenceSystems: Array<ExistenceSystem<T>>,
      private tickSystems: Array<TickSystem<T>>) {
    // TODO impl entityMoved
  }

  shouldUpdate(nextCoordinates: Point) {
    return this.entityFinderRecord.shouldUpdate(nextCoordinates);
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    this.entityFinderRecord.update(nextCoordinates, samplingRadius);

    for (let entity of this.entityFinderRecord.enteringEntities) {
      for (let system of this.existenceSystems) {
        system.enter(entity);
      }
    }

    for (let entity of this.entityFinderRecord.exitingEntities) {
      for (let systemIndex = this.existenceSystems.length - 1; systemIndex >= 0; systemIndex--) {
        this.existenceSystems[systemIndex].exit(entity);
      }
    }

    if (this.entityFinderRecord.enteringEntities.length > 0
        || this.entityFinderRecord.exitingEntities.length > 0) {
      return this.existenceSystems;
    }
    return [];
  }

  tick() {
    for (let entity of this.entityFinderRecord.currentEntities) {
      for (let system of this.tickSystems) {
        system.tick(entity);
      }
    }
  }

  onEntityRegistered(entity: T) {
    if (this.entityFinderRecord.currentEntities.has(entity)) {
      return;
    }
    for (let system of this.existenceSystems) {
      system.enter(entity);
      system.finish();
    }
  }
}
