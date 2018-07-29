import {asSequence, default as Sequence} from 'sequency';
import {Component} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import VisibilitySystem from '../../entitySystem/system/visibility/VisibilitySystem';
import DynamicProvider from '../../util/DynamicProvider';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import Distance from '../../util/math/Distance';
import {leftOuterJoin} from '../../util/set';
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
      trackee: Entity,
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
  asSequence(tickers).reverse().forEach(ticker => ticker.backwardTick());
}

export class EntityFinderRecordsSampler {
  constructor(
      private readonly trackee: Entity,
      private readonly samplingRadius: DynamicProvider<number>,
      private readonly distanceChecker: DistanceChecker,
      private readonly currentCoordinates: Point = trackee.coordinates.clone()) {
  }

  update(records: Array<EntityFinderRecord<Entity>>) {
    const nextCoordinates = this.trackee.coordinates;
    const samplingRadius = this.samplingRadius.getValue();
    const updatedRecordsCount = this.getEntityFinderRecordsToUpdate(records, nextCoordinates)
        .onEach(record => record.update(nextCoordinates, samplingRadius))
        .count(record => record.hasUpdate());

    if (this.samplingRadius.hasUpdate()) {
      this.distanceChecker.updateDistance(samplingRadius);
      this.samplingRadius.commitUpdate();
    }
    if (updatedRecordsCount === records.length) {
      this.currentCoordinates.copyFrom(nextCoordinates);
    }
  }

  private getEntityFinderRecordsToUpdate(
      records: Iterable<EntityFinderRecord<Entity>>, nextCoordinates: Point) {
    const sequence = asSequence(records);

    if (!this.distanceChecker.updatingDistance.isClose(nextCoordinates, this.currentCoordinates)) {
      return sequence;
    }

    if (this.samplingRadius.hasUpdate()) {
      return sequence;
    }

    return sequence.filter(record => record.shouldUpdate());
  }
}

export class EntityFinderRecord<T extends Entity> {
  constructor(
      private readonly entityFinder: EntityFinder<T>,
      private readonly distanceChecker: DistanceChecker,
      private readonly currentCoordinates: Point = Point.origin(),
      private enteringEntitiesList: Array<Iterable<T>> = [],
      private exitingEntitiesList: Array<Iterable<T>> = [],
      public currentEntities: ReadonlySet<T> = new Set(),
      private shouldUpdateEntities: boolean = true) {
    entityFinder.onEntitiesRegistered.add(this.onEntitiesRegistered, this);
    entityFinder.onEntitiesDeregistered.add(this.onEntitiesDeregistered, this);
  }

  shouldUpdate() {
    return this.shouldUpdateEntities;
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    const nextEntities = new Set(this.entityFinder.listAround(nextCoordinates, samplingRadius));
    const enteringEntities = leftOuterJoin(nextEntities, this.currentEntities);
    const exitingEntities = leftOuterJoin(this.currentEntities, nextEntities);

    this.currentEntities = nextEntities;
    this.enteringEntitiesList.push(enteringEntities);
    this.exitingEntitiesList.push(exitingEntities);

    this.currentCoordinates.copyFrom(nextCoordinates);

    this.shouldUpdateEntities = false;
  }

  hasUpdate() {
    return this.enteringEntitiesList.length > 0 || this.exitingEntitiesList.length > 0;
  }

  fetchEnteringEntities(): Sequence<T> {
    const enteringEntitiesList = this.enteringEntitiesList;
    this.enteringEntitiesList = [];

    return asSequence(enteringEntitiesList).flatten();
  }

  fetchExitingEntities(): Sequence<T> {
    const exitingEntitiesList = this.exitingEntitiesList;
    this.exitingEntitiesList = [];

    return asSequence(exitingEntitiesList).flatten();
  }

  private onEntitiesRegistered(entities: ReadonlyArray<T>) {
    this.shouldUpdateEntities = this.shouldUpdateEntities || entities.some(
        entity => this.distanceChecker.isInEnteringRadius(this.currentCoordinates, entity));
  }

  private onEntitiesDeregistered(entities: ReadonlyArray<T>) {
    this.shouldUpdateEntities = this.shouldUpdateEntities || entities.some(
        entity => this.currentEntities.has(entity));
  }
}

export class DistanceChecker {
  private enteringDistance: Distance;

  constructor(
      samplingRadius: number,
      private readonly updatingRadius: number,
      readonly updatingDistance: Distance = new Distance(updatingRadius)) {
    this.updateDistance(samplingRadius);
  }

  isInEnteringRadius(currentCoordinates: Point, entity: Entity) {
    return this.enteringDistance.isClose(currentCoordinates, entity.coordinates);
  }

  updateDistance(samplingRadius: number) {
    this.enteringDistance = new Distance(samplingRadius + this.updatingRadius);
  }
}

export class SystemTicker<T = Component, U extends T & Entity = T & Entity> {
  constructor(
      private readonly systems: Array<VisibilitySystem<T>>,
      private readonly entityFinderRecord: EntityFinderRecord<U>,
      private readonly systemFinisher: SystemFinisher,
      private isVisibilityChanged: boolean = false) {
  }

  backwardTick() {
    const entitiesCount = this.entityFinderRecord.fetchExitingEntities()
        .onEach(entity => {
          for (const system of this.systems) {
            system.exit(entity);
          }
        })
        .count();
    if (entitiesCount > 0) {
      this.isVisibilityChanged = true;
    }
  }

  firstForwardTick(time: Phaser.Time) {
    const enteringEntities = this.entityFinderRecord.fetchEnteringEntities()
        .onEach(entity => {
          for (const system of this.systems) {
            system.enter(entity);
          }
        })
        .toSet();
    if (enteringEntities.size > 0) {
      this.isVisibilityChanged = true;
    }

    for (const entity of leftOuterJoin(this.entityFinderRecord.currentEntities, enteringEntities)) {
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
