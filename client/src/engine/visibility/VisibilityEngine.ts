import EntityFinder, {StateChanged} from '../../util/entityStorage/EntityFinder';
import Entity from '../../entitySystem/Entity';
import VisibilitySystem from '../../entitySystem/system/visibility/VisibilitySystem';
import VisibilityEngineBuilder from './VisibilityEngineBuilder';
import {OnOrBuildClause} from './visibilityEngineBuilderLanguage';
import Point from '../../util/syntax/Point';
import DynamicProvider from '../../util/DynamicProvider';
import Distance from '../../util/math/Distance';
import {asSequence, default as Sequence} from 'sequency';
import SystemEngine from '../SystemEngine';
import {Component} from '../../entitySystem/alias';
import {leftOuterJoin} from '../../util/set';

/**
 * Updates visibility of entities around an entity when it moves a certain distance.
 */
class VisibilityEngine implements SystemEngine {
  constructor(
      private sampler: EntityFinderRecordsSampler,
      private entityFinderRecords: Array<EntityFinderRecord<Entity>>,
      private onUpdateTickers: SystemTicker[],
      private onRenderTickers: SystemTicker[],
      private systemFinisher: SystemFinisher) {
  }

  static newBuilder(
      trackee: Entity,
      samplingRadius: DynamicProvider<number>,
      updatingRadius: number) {
    let builder = new VisibilityEngineBuilder(trackee, samplingRadius, updatingRadius);
    return new OnOrBuildClause(builder);
  }

  private static tickSystemsForward(tickers: SystemTicker[], time: Phaser.Time) {
    for (const ticker of tickers) {
      ticker.firstForwardTick(time);
    }
    for (const ticker of tickers) {
      ticker.secondForwardTick();
    }
  }

  private static tickSystemsBackward(tickers: SystemTicker[]) {
    asSequence(tickers).reverse().forEach(ticker => ticker.backwardTick());
  }

  updateBegin(time: Phaser.Time) {
    VisibilityEngine.tickSystemsForward(this.onUpdateTickers, time);
    this.systemFinisher.finish();
  }

  updateEnd(time: Phaser.Time) {
    this.sampler.update(this.entityFinderRecords);
    VisibilityEngine.tickSystemsBackward(this.onUpdateTickers);
  }

  renderBegin(time: Phaser.Time) {
    VisibilityEngine.tickSystemsForward(this.onRenderTickers, time);
    this.systemFinisher.finish();
  }

  renderEnd(time: Phaser.Time) {
    VisibilityEngine.tickSystemsBackward(this.onRenderTickers);
  }
}

export default VisibilityEngine;

export class EntityFinderRecordsSampler {
  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      private distanceChecker: DistanceChecker,
      private currentCoordinates: Point = trackee.coordinates.clone()) {
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
      private entityFinder: EntityFinder<T>,
      private distanceChecker: DistanceChecker,
      private currentCoordinates: Point = Point.origin(),
      private enteringEntitiesList: Array<Iterable<T>> = [],
      private exitingEntitiesList: Array<Iterable<T>> = [],
      public currentEntities: ReadonlySet<T> = new Set(),
      private shouldUpdateEntities: boolean = true) {
    entityFinder.onStateChanged.add(this.onStateChanged, this);
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

  private onStateChanged(stateChanged: StateChanged<T>) {
    if (this.shouldUpdateEntities) {
      return;
    }
    this.shouldUpdateEntities = this.shouldRecordUpdate(stateChanged);
  }

  private shouldRecordUpdate(stateChanged: StateChanged<T>) {
    if (stateChanged.registeredEntities.some(
            entity => this.distanceChecker.isInEnteringRadius(this.currentCoordinates, entity))) {
      return true;
    }
    if (stateChanged.removedEntities.some(entity => this.currentEntities.has(entity))) {
      return true;
    }
    return false;
  }
}

export class DistanceChecker {
  private enteringDistance: Distance;

  constructor(
      samplingRadius: number,
      private updatingRadius: number,
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
      private systems: Array<VisibilitySystem<T>>,
      private entityFinderRecord: EntityFinderRecord<U>,
      private systemFinisher: SystemFinisher,
      private isVisibilityChanged: boolean = false) {
  }

  backwardTick() {
    let entitiesCount = this.entityFinderRecord.fetchExitingEntities()
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
    let enteringEntities = this.entityFinderRecord.fetchEnteringEntities()
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
  constructor(private systems: Set<VisibilitySystem<Component>> = new Set()) {
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
