import {asSequence} from 'sequency';
import {Component, MovableEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import VisibilitySystem from '../../entitySystem/system/visibility/VisibilitySystem';
import {Phaser} from '../../util/alias/phaser';
import SetStreamJoiner from '../../util/dataStructures/SetStreamJoiner';
import StreamJoiner from '../../util/dataStructures/StreamJoiner';
import DynamicProvider from '../../util/DynamicProvider';
import EntityFinder, {Collector} from '../../util/entityStorage/EntityFinder';
import Distance from '../../util/math/Distance';
import Point from '../../util/syntax/Point';
import SystemEngine from '../SystemEngine';
import VisibilityEngineBuilder from './VisibilityEngineBuilder';
import {OnOrBuildClause} from './visibilityEngineBuilderLanguage';

/**
 * Applies systems to all entities around an entity if it has moved a certain distance.
 */
class VisibilityEngine implements SystemEngine {
  constructor(
      private readonly sampler: EntityFinderRecordsSampler,
      private readonly entityFinderRecords: Array<EntityFinderRecord<Entity>>,
      private readonly onUpdateTickers: SystemTicker[],
      private readonly onRenderTickers: SystemTicker[],
      private readonly systemFinisher: SystemFinisher) {
  }

  static newBuilder(
      trackee: MovableEntity,
      samplingRadius: DynamicProvider<number>,
      updatingRadius: number) {
    const builder = new VisibilityEngineBuilder(trackee, samplingRadius, updatingRadius);
    return new OnOrBuildClause(builder);
  }

  updateBegin(time: Phaser.Time) {
    tickSystemsForward(this.onUpdateTickers, time);
    this.systemFinisher.finish();
  }

  updateEnd(time: Phaser.Time) {
    this.sampler.update(this.entityFinderRecords);
    tickSystemsBackward(this.onUpdateTickers);
  }

  renderBegin(time: Phaser.Time) {
    tickSystemsForward(this.onRenderTickers, time);
    this.systemFinisher.finish();
  }

  renderEnd(time: Phaser.Time) {
    tickSystemsBackward(this.onRenderTickers);
  }
}

function tickSystemsForward(tickers: SystemTicker[], time: Phaser.Time) {
  for (const ticker of tickers) {
    ticker.firstForwardTick(time);
  }
  for (const ticker of tickers) {
    ticker.secondForwardTick();
  }
}

function tickSystemsBackward(tickers: SystemTicker[]) {
  // noinspection TsLint
  for (var tickerIndex = tickers.length - 1; tickerIndex >= 0; --tickerIndex) {
    tickers[tickerIndex].backwardTick();
  }
}

export class EntityFinderRecordsSampler {
  constructor(
      private readonly trackee: MovableEntity,
      private readonly samplingRadius: DynamicProvider<number>,
      private readonly distanceChecker: DistanceChecker,
      private readonly currentCoordinates: Phaser.Point = trackee.coordinates.clone()) {
  }

  update(records: Array<EntityFinderRecord<Entity>>) {
    const nextCoordinates = this.trackee.coordinates;
    const samplingRadius = this.samplingRadius.getValue();
    let updatedRecordsCount = 0;
    for (const record of this.getEntityFinderRecordsToUpdate(records, nextCoordinates)) {
      record.update(nextCoordinates, samplingRadius);

      if (!record.hasUpdate()) {
        continue;
      }
      updatedRecordsCount++;
    }

    if (this.samplingRadius.hasUpdate()) {
      this.distanceChecker.updateDistance(samplingRadius);
      this.samplingRadius.commitUpdate();
    }
    if (updatedRecordsCount === records.length) {
      this.currentCoordinates.copyFrom(nextCoordinates);
    }
  }

  private* getEntityFinderRecordsToUpdate(
      records: Iterable<EntityFinderRecord<Entity>>, nextCoordinates: Phaser.ReadonlyPoint) {
    if (!this.distanceChecker.updatingDistance.isClose(nextCoordinates, this.currentCoordinates)) {
      yield* records;
      return;
    }

    if (this.samplingRadius.hasUpdate()) {
      yield* records;
      return;
    }

    for (const record of records) {
      if (!record.shouldUpdate()) {
        continue;
      }
      yield record;
    }
  }
}

export class EntityFinderRecord<T extends Entity> {
  constructor(
      private readonly entityFinder: EntityFinder<T>,
      private readonly distanceChecker: DistanceChecker,
      private readonly currentCoordinates: Point = Point.origin(),
      private readonly joiner: StreamJoiner<T> & Collector<T> = new SetStreamJoiner(),
      private isEnteringEntitiesFetched = false,
      private isExitingEntitiesFetched = false,
      private shouldUpdateEntities: boolean = true) {
    entityFinder.onEntitiesRegistered.add(this.onEntitiesExistenceChanged, this);
    entityFinder.onEntitiesDeregistered.add(this.onEntitiesExistenceChanged, this);
  }

  shouldUpdate() {
    return this.shouldUpdateEntities;
  }

  update(nextCoordinates: Phaser.ReadonlyPoint, samplingRadius: number) {
    this.joiner.flush();
    this.entityFinder.collectAround(nextCoordinates, samplingRadius, this.joiner);

    this.currentCoordinates.copyFrom(nextCoordinates);

    this.isEnteringEntitiesFetched = false;
    this.isExitingEntitiesFetched = false;

    this.shouldUpdateEntities = false;
  }

  hasUpdate(): boolean {
    return asSequence(this.joiner.leftValues).any() || asSequence(this.joiner.rightValues).any();
  }

  * fetchEnteringEntities(): Iterable<T> {
    if (this.isEnteringEntitiesFetched) {
      return;
    }
    this.isEnteringEntitiesFetched = true;

    yield* this.joiner.leftValues;
  }

  getCurrentEntities(): Iterable<T> {
    return this.joiner.innerValues;
  }

  * fetchExitingEntities(): Iterable<T> {
    if (this.isExitingEntitiesFetched) {
      return;
    }
    this.isExitingEntitiesFetched = true;

    yield* this.joiner.rightValues;
  }

  private onEntitiesExistenceChanged(entities: ReadonlyArray<T>) {
    if (this.shouldUpdateEntities) {
      return;
    }
    this.shouldUpdateEntities = entities.some(
        entity => this.distanceChecker.isInEnteringRadius(this.currentCoordinates, entity));
  }
}

export class DistanceChecker {
  constructor(
      samplingRadius: number,
      private readonly updatingRadius: number,
      readonly updatingDistance = new Distance(updatingRadius),
      private enteringDistance = createUpdateDistance(samplingRadius, updatingRadius)) {
  }

  isInEnteringRadius(currentCoordinates: Point, entity: Entity) {
    return this.enteringDistance.isClose(currentCoordinates, entity.coordinates);
  }

  updateDistance(samplingRadius: number) {
    this.enteringDistance = createUpdateDistance(samplingRadius, this.updatingRadius);
  }
}

function createUpdateDistance(samplingRadius: number, updatingRadius: number): Distance {
  return new Distance(samplingRadius + updatingRadius);
}

export class SystemTicker<T = Component, U extends T & Entity = T & Entity> {
  constructor(
      private readonly systems: Array<VisibilitySystem<T>>,
      private readonly entityFinderRecord: EntityFinderRecord<U>,
      private readonly systemFinisher: SystemFinisher,
      private isVisibilityChanged: boolean = false) {
  }

  backwardTick() {
    for (const entity of this.entityFinderRecord.fetchExitingEntities()) {
      for (const system of this.systems) {
        system.exit(entity);
      }
      this.isVisibilityChanged = true;
    }
  }

  firstForwardTick(time: Phaser.Time) {
    // TODO entering entities should be entered once
    for (const entity of this.entityFinderRecord.fetchEnteringEntities()) {
      for (const system of this.systems) {
        system.enter(entity);
      }
      this.isVisibilityChanged = true;
    }
    for (const entity of this.entityFinderRecord.getCurrentEntities()) {
      for (const system of this.systems) {
        system.update(entity, time);
      }
    }
  }

  secondForwardTick() {
    if (!this.isVisibilityChanged) {
      return;
    }

    for (const system of this.systems) {
      this.systemFinisher.add(system);
    }

    this.isVisibilityChanged = false;
  }
}

export class SystemFinisher {
  constructor(private readonly systems: Set<VisibilitySystem<Component>> = new Set()) {
  }

  add(system: VisibilitySystem<Component>) {
    this.systems.add(system);
  }

  finish() {
    for (const system of this.systems) {
      system.finish();
    }
    this.systems.clear();
  }
}

export default VisibilityEngine;
