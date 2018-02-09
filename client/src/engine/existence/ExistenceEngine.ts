import ExistenceEngineBuilder from './ExistenceEngineBuilder';
import EntityFinder, {StateChanged} from '../../util/entityStorage/EntityFinder';
import ExistenceSystem from '../../entitySystem/system/existence/ExistenceSystem';
import Entity from '../../entitySystem/Entity';
import {Component} from '../../entitySystem/alias';
import {OnOrBuildClause} from './existenceEngineBuilderLanguage';
import {asSequence} from 'sequency';
import SystemEngine from '../SystemEngine';

class ExistenceEngine implements SystemEngine {
  constructor(
      private onUpdateRelations: ExistenceRelation[],
      private onRenderRelations: ExistenceRelation[]) {
  }

  static newBuilder() {
    return new OnOrBuildClause(new ExistenceEngineBuilder());
  }

  private static tickRelationsBackward(relations: ExistenceRelation[]) {
    asSequence(relations).reverse().forEach(relation => relation.backwardTick());
  }

  private static tickRelationsForward(relations: ExistenceRelation[]) {
    for (let relation of relations) {
      relation.forwardTick();
    }
  }

  updateBegin(time: Phaser.Time) {
    ExistenceEngine.tickRelationsForward(this.onUpdateRelations);
  }

  updateEnd(time: Phaser.Time) {
    ExistenceEngine.tickRelationsBackward(this.onUpdateRelations);
  }

  renderBegin(time: Phaser.Time) {
    ExistenceEngine.tickRelationsForward(this.onRenderRelations);
  }

  renderEnd(time: Phaser.Time) {
    ExistenceEngine.tickRelationsBackward(this.onRenderRelations);
  }
}

export default ExistenceEngine;

export class ExistenceRelation<T = Component, U extends T & Entity = T & Entity> {
  constructor(
      private system: ExistenceSystem<T>,
      private entityFinder: EntityFinder<U>,
      private enteringEntitiesList: Array<ReadonlyArray<T>> = [],
      private exitingEntitiesList: Array<ReadonlyArray<T>> = []) {
    for (let entity of this.entityFinder) {
      this.system.adopt(entity);
    }
    this.entityFinder.onStateChanged.add(this.onStateChanged, this);
  }

  forwardTick() {
    asSequence(this.enteringEntitiesList).flatten().forEach(entity => this.system.adopt(entity));
    this.enteringEntitiesList.length = 0;
  }

  backwardTick() {
    asSequence(this.exitingEntitiesList).flatten().forEach(entity => this.system.abandon(entity));
    this.exitingEntitiesList.length = 0;
  }

  private onStateChanged(stateChanged: StateChanged<U>) {
    this.enteringEntitiesList.push(stateChanged.registeredEntities);
    this.exitingEntitiesList.push(stateChanged.removedEntities);
  }
}
