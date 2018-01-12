import EntityFinder, {ExistenceUpdatedEvent} from '../util/entityStorage/EntityFinder';
import Entity from '../entitySystem/Entity';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import EntityTrackerBuilder from './EntityTrackerBuilder';
import {OnOrBuildClause} from './entityTrackerBuilderWrapper';
import Point from '../util/syntax/Point';
import DynamicProvider from '../util/DynamicProvider';
import Distance from '../util/math/Distance';
import {asSequence} from 'sequency';
import TickSystem from '../entitySystem/system/tick/TickSystem';

/**
 * Tracks an animated entity and triggers callbacks whenever the entity moves from one region to
 * another.
 * The entity must be animated because otherwise it never updates, and thus requires no tracking.
 */
class EntityTracker {
  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      private onUpdateSystemTickers: SystemTicker[],
      private onRenderSystemTickers: SystemTicker[],
      private entityFinderRecords: Array<EntityFinderRecord<Entity>>,
      private distanceChecker: DistanceChecker,
      private currentCoordinate: Point = trackee.coordinates.clone(),
      private updatedRecords: Array<EntityFinderRecord<Entity>> = []) {
  }

  static newBuilder(trackee: Entity, samplingRadius: DynamicProvider<number>) {
    let builder = new EntityTrackerBuilder(trackee, samplingRadius);
    return new OnOrBuildClause(builder);
  }

  private static tickSystemTickers(tickers: SystemTicker[], time: Phaser.Time) {
    asSequence(tickers).reverse().forEach(ticker => ticker.backwardTick(time));
    for (let ticker of tickers) {
      ticker.firstForwardTick(time);
    }
    for (let ticker of tickers) {
      ticker.secondForwardTick(time);
    }
  }

  update(time: Phaser.Time) {
    this.commitRecordsUpdate();

    let nextCoordinates = this.trackee.coordinates;
    let samplingRadius = this.samplingRadius.getValue();
    this.updatedRecords = this.getEntityFinderRecordsToUpdate(nextCoordinates, samplingRadius)
        .onEach(record => record.update(nextCoordinates, samplingRadius))
        .toArray();

    EntityTracker.tickSystemTickers(this.onUpdateSystemTickers, time);

    this.samplingRadius.commitUpdate();
    if (this.updatedRecords.length === this.entityFinderRecords.length) {
      this.currentCoordinate.copyFrom(nextCoordinates);
    }
  }

  render(time: Phaser.Time) {
    EntityTracker.tickSystemTickers(this.onRenderSystemTickers, time);
    this.commitRecordsUpdate();
  }

  private commitRecordsUpdate() {
    for (let record of this.updatedRecords) {
      record.commitUpdate();
    }
    this.updatedRecords.length = 0;
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
      private shouldUpdateEntities: boolean = true) {
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
  }

  commitUpdate() {
    this.enteringEntities.length = 0;
    this.exitingEntities.length = 0;
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
      private samplingRadius: DynamicProvider<number>,
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

  private updateDistance() {
    this.enteringDistance = new Distance(this.samplingRadius.getValue() + this.updatingRadius);
  }

  private isInDistance(distance: Distance, entity: Entity) {
    return distance.isClose(this.trackee.coordinates, entity.coordinates);
  }
}

export interface SystemTicker {
  backwardTick(time: Phaser.Time): void;

  firstForwardTick(time: Phaser.Time): void;

  secondForwardTick(time: Phaser.Time): void;
}

export class RecordSystemTicker<T, U extends T & Entity> implements SystemTicker {
  constructor(
      private system: ExistenceSystem<T>,
      private entityFinderRecord: EntityFinderRecord<U>,
      private isExistenceChanged: boolean = false) {
  }

  backwardTick() {
    if (this.entityFinderRecord.exitingEntities.length > 0) {
      for (let entity of this.entityFinderRecord.exitingEntities) {
        this.system.exit(entity);
      }
      this.isExistenceChanged = true;
    }
  }

  firstForwardTick(time: Phaser.Time) {
    if (this.entityFinderRecord.enteringEntities.length > 0) {
      for (let entity of this.entityFinderRecord.enteringEntities) {
        this.system.enter(entity);
      }
      this.isExistenceChanged = true;
    }
    for (let entity of this.entityFinderRecord.currentEntities) {
      this.system.update(entity, time);
    }
  }

  secondForwardTick(time: Phaser.Time) {
    if (this.isExistenceChanged) {
      this.system.finish();
      this.isExistenceChanged = false;
    }
  }
}

export class TickSystemTicker implements SystemTicker {
  constructor(private system: TickSystem) {
  }

  backwardTick(time: Phaser.Time) {
  }

  firstForwardTick(time: Phaser.Time) {
    this.system.tick(time);
  }

  secondForwardTick() {
  }
}
