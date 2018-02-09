import Entity from '../../entitySystem/Entity';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import VisibilitySystem from '../../entitySystem/system/visibility/VisibilitySystem';
import DynamicProvider from '../../util/DynamicProvider';
import VisibilityEngine, {
  DistanceChecker,
  EntityFinderRecord,
  EntityFinderRecordsSampler,
  SystemFinisher,
  SystemTicker,
} from './VisibilityEngine';
import {Component} from '../../entitySystem/alias';
import {asSequence} from 'sequency';

export class VisibilityEngineBuilder {
  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      updatingRadius: number,
      private distanceChecker: DistanceChecker =
          new DistanceChecker(trackee, samplingRadius, updatingRadius),
      private relations: Array<VisibilityRelation<Component, Entity>> = []) {
  }

  apply<T, U extends T & Entity>(
      system: VisibilitySystem<T>,
      entityFinder: EntityFinder<U>,
      isOnUpdate: boolean) {
    this.relations.push(new VisibilityRelation(system, entityFinder, isOnUpdate));
    return this;
  }

  build(): VisibilityEngine {
    const sampler =
        new EntityFinderRecordsSampler(this.trackee, this.samplingRadius, this.distanceChecker);
    const systemFinisher = new SystemFinisher();

    const {true: onUpdateRelations, false: onRenderRelations} =
        asSequence(this.relations).partition(relation => relation.isOnUpdate);
    const [onUpdateRecords, onUpdateTickers] =
        this.structureTickers(onUpdateRelations, systemFinisher);
    const [onRenderRecords, onRenderTickers] =
        this.structureTickers(onRenderRelations, systemFinisher);
    const records = asSequence(onUpdateRecords).plus(asSequence(onRenderRecords)).toArray();

    return new VisibilityEngine(sampler, records, onUpdateTickers, onRenderTickers, systemFinisher);
  }

  private structureTickers(
      relations: Iterable<VisibilityRelation<Component, Entity>>,
      systemFinisher: SystemFinisher): [Iterable<EntityFinderRecord<Entity>>, SystemTicker[]] {
    const records: Map<EntityFinder<Entity>, EntityFinderRecord<Entity>> = new Map();
    const recordToSystems: Map<EntityFinderRecord<Entity>, Array<VisibilitySystem<Component>>> = new Map();
    for (const relation of relations) {
      let record = records.get(relation.entityFinder);
      if (record === undefined) {
        record = new EntityFinderRecord(relation.entityFinder, this.distanceChecker);
        records.set(relation.entityFinder, record);
      }

      let applyingSystems = recordToSystems.get(record);
      if (applyingSystems === undefined) {
        applyingSystems = [];
        recordToSystems.set(record, applyingSystems);
      }
      applyingSystems.push(relation.system);
    }

    const tickers = asSequence(recordToSystems)
        .map(([record, applyingSystems]) => new SystemTicker(applyingSystems, record, systemFinisher))
        .toArray();

    return [records.values(), tickers];
  }
}

export default VisibilityEngineBuilder;

class VisibilityRelation<T, U extends T & Entity> {
  constructor(
      readonly system: VisibilitySystem<T>,
      readonly entityFinder: EntityFinder<U>,
      readonly isOnUpdate: boolean) {
  }
}
