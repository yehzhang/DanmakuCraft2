import EntityFinder, {ExistenceUpdatedEvent} from '../util/entityStorage/EntityFinder';
import Entity from '../entitySystem/Entity';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import EntityTrackerBuilder from './EntityTrackerBuilder';
import {ApplyClause} from './entityTrackerBuilderWrapper';
import Point from '../util/syntax/Point';
import DynamicProvider from '../util/DynamicProvider';
import Distance from '../util/math/Distance';
import {asSequence} from 'sequency';

/**
 * Tracks an animated entity and triggers callbacks whenever the entity moves from one region to
 * another.
 * The entity must be animated because otherwise it never updates, and thus requires no tracking.
 */
class EntityTracker {
  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      private systemTickers: Array<SystemTicker<Entity>>,
      private entityFinderRecords: Array<EntityFinderRecord<Entity>>,
      private updateRelations: Array<UpdateRelation<Entity, Entity>>,
      private distanceChecker: DistanceChecker,
      private currentCoordinate: Point = trackee.coordinates.clone()) {
  }

  static newBuilder(trackee: Entity, samplingRadius: DynamicProvider<number>) {
    let builder = new EntityTrackerBuilder(trackee, samplingRadius);
    return new ApplyClause(builder);
  }

  tick(time: Phaser.Time) {
    let nextCoordinates = this.trackee.coordinates;
    let samplingRadius = this.samplingRadius.getValue();
    let updatedRecords = this.getEntityFinderRecordsToUpdate(nextCoordinates, samplingRadius)
        .onEach(record => record.update(nextCoordinates, samplingRadius))
        .toArray();

    asSequence(this.updateRelations).reverse().forEach(relation => relation.backwardTick(time));
    for (let relation of this.updateRelations) {
      relation.forwardTick(time);
    }
    for (let ticker of this.systemTickers) {
      ticker.finishingTick(time);
    }

    for (let record of updatedRecords) {
      record.commitUpdate();
    }
    this.samplingRadius.commitUpdate();
    if (updatedRecords.length === this.entityFinderRecords.length) {
      this.currentCoordinate.copyFrom(nextCoordinates);
    }
  }

  private getEntityFinderRecordsToUpdate(nextCoordinates: Point, samplingRadius: number) {
    let records = asSequence(this.entityFinderRecords);

    if (!this.distanceChecker.updatingDistance.isClose(nextCoordinates, this.currentCoordinate)) {
      return records;
    }

    if (this.samplingRadius.hasUpdate()) {
      return records;
    }

    return records.filter(record => record.shouldUpdate(nextCoordinates, samplingRadius));
  }
}

export default EntityTracker;

export class EntityFinderRecord<T extends Entity> {
  constructor(
      private entityFinder: EntityFinder<T>,
      private distanceChecker: DistanceChecker,
      public currentEntities: Set<T> = new Set(),
      public enteringEntities: T[] = [],
      public exitingEntities: T[] = [],
      private shouldUpdateEntities: boolean = true,
      private hasUpdatedEntities: boolean = false) {
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
    return this.shouldUpdateEntities;
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    let nextEntities = new Set(this.entityFinder.listAround(nextCoordinates, samplingRadius));
    this.enteringEntities = EntityFinderRecord.leftOuterJoin(nextEntities, this.currentEntities);
    this.exitingEntities = EntityFinderRecord.leftOuterJoin(this.currentEntities, nextEntities);
    this.currentEntities = nextEntities;

    this.shouldUpdateEntities = false;
    this.hasUpdatedEntities = this.enteringEntities.length > 0 || this.exitingEntities.length > 0;
  }

  hasUpdate() {
    return this.hasUpdatedEntities;
  }

  commitUpdate() {
    this.enteringEntities.length = 0;
    this.exitingEntities.length = 0;
    this.hasUpdatedEntities = false;
  }

  private onEntityUpdated(existenceUpdated: ExistenceUpdatedEvent<T>) {
    if (this.shouldUpdateEntities) {
      return;
    }
    this.shouldUpdateEntities = this.shouldRecordUpdate(existenceUpdated);
  }

  private shouldRecordUpdate(existenceUpdated: ExistenceUpdatedEvent<T>) {
    if (existenceUpdated.registeredEntities.some(
            entity => this.distanceChecker.isInEnteringRadius(entity))) {
      return true;
    }
    if (existenceUpdated.removedEntities.some(entity => this.currentEntities.has(entity))) {
      return true;
    }
    return false;
  }
}

export class DistanceChecker {
  private enteringDistance: Distance;

  constructor(
      private trackee: Entity,
      readonly samplingRadius: DynamicProvider<number>,
      private updatingRadius: number,
      readonly updatingDistance: Distance = new Distance(updatingRadius)) {
    this.updateDistance();
  }

  isInEnteringRadius(entity: Entity) {
    if (this.samplingRadius.hasUpdate()) {
      this.updateDistance();
    }
    return this.isInDistance(this.enteringDistance, entity);
  }

  isInUpdatingRadius(entity: Entity) {
    return this.isInDistance(this.updatingDistance, entity);
  }

  private updateDistance() {
    this.enteringDistance = new Distance(this.samplingRadius.getValue() + this.updatingRadius);
  }

  private isInDistance(distance: Distance, entity: Entity) {
    return distance.isClose(this.trackee.coordinates, entity.coordinates);
  }
}

export interface SystemTicker<T> {
  forwardUpdate<U extends T & Entity>(record: EntityFinderRecord<U>, time: Phaser.Time): void;

  backwardUpdate<U extends T & Entity>(record: EntityFinderRecord<U>, time: Phaser.Time): void;

  finishingTick(time: Phaser.Time): void;
}

export class TickSystemTicker<T> implements SystemTicker<T> {
  constructor(private system: TickSystem<T>) {
  }

  forwardUpdate<U extends T & Entity>(record: EntityFinderRecord<U>, time: Phaser.Time) {
    for (let entity of record.currentEntities) {
      this.system.update(entity, time);
    }
  }

  backwardUpdate() {
  }

  finishingTick(time: Phaser.Time) {
    this.system.tick(time);
  }
}

export class ExistenceSystemTicker<T> implements SystemTicker<T> {
  constructor(private system: ExistenceSystem<T>, private hasUpdate: boolean = false) {
  }

  forwardUpdate<U extends T & Entity>(record: EntityFinderRecord<U>) {
    if (!record.hasUpdate()) {
      return;
    }

    for (let entity of record.enteringEntities) {
      this.system.enter(entity);
    }

    this.hasUpdate = true;
  }

  backwardUpdate<U extends T & Entity>(record: EntityFinderRecord<U>) {
    if (!record.hasUpdate()) {
      return;
    }

    for (let entity of record.exitingEntities) {
      this.system.exit(entity);
    }

    this.hasUpdate = true;
  }

  finishingTick() {
    if (this.hasUpdate) {
      this.system.finish();
      this.hasUpdate = false;
    }
  }
}

export class UpdateRelation<T, U extends T & Entity> {
  constructor(private ticker: SystemTicker<T>, private record: EntityFinderRecord<U>) {
  }

  forwardTick(time: Phaser.Time) {
    this.ticker.forwardUpdate(this.record, time);
  }

  backwardTick(time: Phaser.Time) {
    this.ticker.backwardUpdate(this.record, time);
  }
}
