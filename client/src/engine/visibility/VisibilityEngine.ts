import EntityFinder, {ExistenceUpdatedEvent} from '../../util/entityStorage/EntityFinder';
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

  static newBuilder(trackee: Entity, samplingRadius: DynamicProvider<number>) {
    let builder = new VisibilityEngineBuilder(trackee, samplingRadius);
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
      private currentCoordinate: Point = trackee.coordinates.clone()) {
  }

  update(records: Array<EntityFinderRecord<Entity>>) {
    let nextCoordinates = this.trackee.coordinates;
    let samplingRadius = this.samplingRadius.getValue();
    let updatedRecordsCount = this.getEntityFinderRecordsToUpdate(records, nextCoordinates)
        .onEach(record => record.update(nextCoordinates, samplingRadius))
        .count(record => record.hasUpdate());

    this.samplingRadius.commitUpdate();
    if (updatedRecordsCount === records.length) {
      this.currentCoordinate.copyFrom(nextCoordinates);
    }
  }

  private getEntityFinderRecordsToUpdate(
      records: Iterable<EntityFinderRecord<Entity>>, nextCoordinates: Point) {
    const sequence = asSequence(records);

    if (!this.distanceChecker.updatingDistance.isClose(nextCoordinates, this.currentCoordinate)) {
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
      private enteringEntitiesList: T[][] = [],
      private exitingEntitiesList: T[][] = [],
      public currentEntities: Set<T> = new Set(),
      private shouldUpdateEntities: boolean = true) {
    entityFinder.entityExistenceUpdated.add(this.onEntityUpdated, this);
  }

  private static leftOuterJoin<T>(set: Iterable<T>, other: Set<T>): T[] {
    let difference = [];
    for (const element of set) {
      if (!other.has(element)) {
        difference.push(element);
      }
    }
    return difference;
  }

  shouldUpdate() {
    return this.shouldUpdateEntities;
  }

  update(nextCoordinates: Point, samplingRadius: number) {
    let nextEntities = new Set(this.entityFinder.listAround(nextCoordinates, samplingRadius));
    const enteringEntities = EntityFinderRecord.leftOuterJoin(nextEntities, this.currentEntities);
    const exitingEntities = EntityFinderRecord.leftOuterJoin(this.currentEntities, nextEntities);

    this.currentEntities = nextEntities;
    if (enteringEntities.length > 0) {
      this.enteringEntitiesList.push(enteringEntities);
    }
    if (exitingEntities.length > 0) {
      this.exitingEntitiesList.push(exitingEntities);
    }

    this.shouldUpdateEntities = false;
  }

  hasUpdate() {
    return this.enteringEntitiesList.length > 0 || this.exitingEntitiesList.length > 0;
  }

  fetchEnteringEntities(): Sequence<T> {
    let enteringEntitiesList = this.enteringEntitiesList;
    this.enteringEntitiesList = [];

    return asSequence(enteringEntitiesList).flatten();
  }

  fetchExitingEntities(): Sequence<T> {
    let exitingEntitiesList = this.exitingEntitiesList;
    this.exitingEntitiesList = [];

    return asSequence(exitingEntitiesList).flatten();
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
    let entitiesCount = this.entityFinderRecord.fetchEnteringEntities()
        .onEach(entity => {
          for (const system of this.systems) {
            system.enter(entity);
          }
        })
        .count();
    if (entitiesCount > 0) {
      this.isVisibilityChanged = true;
    }

    for (const entity of this.entityFinderRecord.currentEntities) {
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
