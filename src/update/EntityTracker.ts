import EntityFinder, {EntityExistenceUpdatedEvent} from '../util/entityStorage/EntityFinder';
import Entity from '../entitySystem/Entity';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import EntityTrackerBuilder from './EntityTrackerBuilder';
import {ApplyClause} from './entityTrackerBuilderWrapper';
import Point from '../util/syntax/Point';
import {validateRadius} from '../law/space';
import DynamicProvider from '../util/DynamicProvider';
import {asSequence} from 'sequency';
import Distance from '../util/math/Distance';

/**
 * Tracks an animated entity and triggers callbacks whenever the entity moves from one region to
 * another.
 * The entity must be animated because otherwise it never updates, and thus requires no tracking.
 */
class EntityTracker {
  private currentCoordinate: Point;

  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      private trackingRecords: OneEntityFinderToManySystemsRecord[],
      private existenceSystemsFinisher: ExistenceSystemsFinisher) {
    this.currentCoordinate = trackee.coordinates.clone();
    validateRadius(samplingRadius.getValue());
  }

  static newBuilder(trackee: Entity, samplingRadius: DynamicProvider<number>) {
    let builder = new EntityTrackerBuilder(trackee, samplingRadius, new Map());
    return new ApplyClause(builder);
  }

  tick(time: Phaser.Time) {
    let nextCoordinates = this.trackee.coordinates;
    let samplingRadius = this.samplingRadius.getValue();
    let sequence = asSequence(this.trackingRecords);
    if (this.samplingRadius.hasUpdate()) {
      this.samplingRadius.commitUpdate();
    } else {
      sequence = sequence.filter(record => record.shouldUpdate(nextCoordinates, samplingRadius));
    }
    sequence.forEach(record => record.update(this.currentCoordinate, samplingRadius));
    this.existenceSystemsFinisher.finishSystems();

    this.currentCoordinate = nextCoordinates.clone();

    for (let trackingRecord of this.trackingRecords) {
      trackingRecord.tick(time);
    }
  }
}

export default EntityTracker;

export class EntityFinderRecord<T extends Entity> {
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

  shouldUpdate(nextCoordinates: Point, samplingRadius: number) {
    if (this.isCurrentEntitiesOutdated) {
      return true;
    }

    let nextAnchorEntity = this.entityFinder.findClosestEntityTo(nextCoordinates);
    if (this.currentAnchorEntity !== nextAnchorEntity) {
      return true;
    }

    if (nextAnchorEntity != null) {
      let distance = new Distance(samplingRadius);
      if (!distance.isClose(nextAnchorEntity.coordinates, nextCoordinates)) {
        return true;
      }
    }

    return false;
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    let nextRegionArray =
        this.entityFinder.listAround(nextCoordinates, samplingRadius);
    let nextEntities = new Set(nextRegionArray);
    this.enteringEntities = EntityFinderRecord.leftOuterJoin(nextEntities, this.currentEntities);
    this.exitingEntities = EntityFinderRecord.leftOuterJoin(this.currentEntities, nextEntities);
    this.currentEntities = nextEntities;

    this.currentAnchorEntity = this.entityFinder.findClosestEntityTo(nextCoordinates);
    this.isCurrentEntitiesOutdated = false;
  }

  private onEntityUpdated(entityUpdatedEvent: EntityExistenceUpdatedEvent<T>) {
    if (entityUpdatedEvent.registeredEntity) {
      // TODO check if the entity is within the sampling radius? But chunk finder returns chunks
      // out of the radius
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

export class OneEntityFinderToManySystemsRecord<T extends Entity = Entity> {
  constructor(
      private entityFinderRecord: EntityFinderRecord<T>,
      private existenceSystems: Array<ExistenceSystem<T>>,
      private tickSystems: Array<TickSystem<T>>,
      private existenceSystemsFinisher: ExistenceSystemsFinisher) {
  }

  shouldUpdate(nextCoordinates: Point, samplingRadius: number) {
    return this.entityFinderRecord.shouldUpdate(nextCoordinates, samplingRadius);
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

  tick(time: Phaser.Time) {
    for (let entity of this.entityFinderRecord.currentEntities) {
      for (let system of this.tickSystems) {
        system.update(entity, time);
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
