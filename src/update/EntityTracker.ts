import EntityFinder, {EntityExistenceUpdatedEvent} from '../util/entityStorage/EntityFinder';
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
      private trackingRecords: OneEntityFinderToManySystemsRecord[],
      private existenceSystemsFinisher: ExistenceSystemsFinisher) {
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

    let nextCoordinates = this.trackee.coordinates;
    let trackingRecords =
        this.trackingRecords.filter(trackingRecord => trackingRecord.shouldUpdate(nextCoordinates));
    this.updateTrackingRecords(trackingRecords);

    this.currentCoordinate = nextCoordinates.clone();
  }

  private updateTrackingRecords(trackingRecords: OneEntityFinderToManySystemsRecord[]) {
    for (let trackingRecord of trackingRecords) {
      trackingRecord.update(this.currentCoordinate, this.samplingRadius);
    }
    this.existenceSystemsFinisher.finishSystems();
  }
}

export default EntityTracker;

export class EntityFinderRecord<T> {
  constructor(
      private entityFinder: EntityFinder<T>,
      private currentAnchorEntity: T | null = null,
      public enteringEntities: T[] = [],
      public exitingEntities: T[] = [],
      public currentEntities: Set<T> = new Set(),
      private isCurrentEntitiesOutdated = false) {
    entityFinder.entityExistenceUpdated.add(this.onEntityUpdated, this);
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
    if (this.isCurrentEntitiesOutdated) {
      return true;
    }

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
    this.isCurrentEntitiesOutdated = false;
  }

  private onEntityUpdated(entityUpdatedEvent: EntityExistenceUpdatedEvent<T>) {
    if (entityUpdatedEvent.registeredEntity) {
      // Theoretically there is a way to check if the entity is within the tracking bounds?
      this.isCurrentEntitiesOutdated = true;
      return;
    }
    if (entityUpdatedEvent.removedEntity) {
      if (this.currentEntities.has(entityUpdatedEvent.removedEntity)) {
        this.isCurrentEntitiesOutdated = true;
        return;
      }
    }
  }
}

export class OneEntityFinderToManySystemsRecord<T = Component> {
  constructor(
      private entityFinderRecord: EntityFinderRecord<T>,
      private existenceSystems: Array<ExistenceSystem<T>>,
      private tickSystems: Array<TickSystem<T>>,
      private existenceSystemsFinisher: ExistenceSystemsFinisher) {
  }

  shouldUpdate(nextCoordinates: Point) {
    return this.entityFinderRecord.shouldUpdate(nextCoordinates);
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    this.entityFinderRecord.update(nextCoordinates, samplingRadius);

    for (let entity of this.entityFinderRecord.exitingEntities) {
      this.exitSystems(entity);
    }

    for (let entity of this.entityFinderRecord.enteringEntities) {
      this.enterSystems(entity);
    }

    if (this.entityFinderRecord.enteringEntities.length > 0
        || this.entityFinderRecord.exitingEntities.length > 0) {
      this.registerToFinishEnteredOrExitedSystems();
    }
  }

  tick() {
    for (let entity of this.entityFinderRecord.currentEntities) {
      for (let system of this.tickSystems) {
        system.tick(entity);
      }
    }
  }

  private enterSystems(entity: T) {
    for (let system of this.existenceSystems) {
      system.enter(entity);
    }
  }

  private exitSystems(entity: T) {
    for (let systemIndex = this.existenceSystems.length - 1; systemIndex >= 0; systemIndex--) {
      this.existenceSystems[systemIndex].exit(entity);
    }
  }

  private registerToFinishEnteredOrExitedSystems() {
    for (let system of this.existenceSystems) {
      this.existenceSystemsFinisher.register(system);
    }
  }
}

export class ExistenceSystemsFinisher {
  constructor(private systems: Set<ExistenceSystem<any>> = new Set()) {
  }

  register(system: ExistenceSystem<any>) {
    this.systems.add(system);
  }

  finishSystems() {
    for (let system of this.systems) {
      system.finish();
    }
    this.systems.clear();
  }
}
