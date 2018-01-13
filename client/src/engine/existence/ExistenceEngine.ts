import ExistenceEngineBuilder from './ExistenceEngineBuilder';
import EntityFinder, {ExistenceUpdatedEvent} from '../../util/entityStorage/EntityFinder';
import ExistenceSystem from '../../entitySystem/system/existence/ExistenceSystem';
import Entity from '../../entitySystem/Entity';
import {Component} from '../../entitySystem/alias';
import {OnOrBuildClause} from './existenceEngineBuilderWrapper';
import {asSequence} from 'sequency';

class ExistenceEngine {
  constructor(
      private onUpdateRelations: ExistenceRelation[],
      private onRenderRelations: ExistenceRelation[]) {
  }

  static newBuilder() {
    return new OnOrBuildClause(new ExistenceEngineBuilder());
  }

  private static tickRelations(relations: ExistenceRelation[]) {
    asSequence(relations).reverse().forEach(relation => relation.backwardTick());
    for (let relation of relations) {
      relation.forwardTick();
    }
  }

  update() {
    ExistenceEngine.tickRelations(this.onUpdateRelations);
  }

  render() {
    ExistenceEngine.tickRelations(this.onRenderRelations);
  }
}

export default ExistenceEngine;

export class ExistenceRelation<T = Component, U extends T & Entity = T & Entity> {
  constructor(
      private system: ExistenceSystem<T>,
      private entityFinder: EntityFinder<U>,
      private enteringEntities: U[][] = [],
      private exitingEntities: U[][] = []) {
    for (let entity of this.entityFinder) {
      this.system.adopt(entity);
    }
    this.entityFinder.entityExistenceUpdated.add(this.onEntityExistenceUpdated, this);
  }

  forwardTick() {
    asSequence(this.enteringEntities).flatten().forEach(entity => this.system.adopt(entity));
    this.enteringEntities.length = 0;
  }

  backwardTick() {
    asSequence(this.exitingEntities).flatten().forEach(entity => this.system.abandon(entity));
    this.exitingEntities.length = 0;
  }

  private onEntityExistenceUpdated(existenceUpdated: ExistenceUpdatedEvent<U>) {
    this.enteringEntities.push(existenceUpdated.registeredEntities);
    this.exitingEntities.push(existenceUpdated.removedEntities);
  }
}
