import {asSequence} from 'sequency';
import {Component} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import ExistenceSystem from '../../entitySystem/system/existence/ExistenceSystem';
import EntityFinder, {StateChanged} from '../../util/entityStorage/EntityFinder';
import SystemEngine from '../SystemEngine';
import ExistenceEngineBuilder from './ExistenceEngineBuilder';
import {OnOrBuildClause} from './existenceEngineBuilderLanguage';

/**
 * Applies systems to entities every time they are registered or deregistered.
 */
class ExistenceEngine implements SystemEngine {
  constructor(
      private readonly onUpdateRelations: ExistenceRelation[],
      private readonly onRenderRelations: ExistenceRelation[]) {
  }

  static newBuilder() {
    return new OnOrBuildClause(new ExistenceEngineBuilder());
  }

  updateBegin(time: Phaser.Time) {
    tickRelationsForward(this.onUpdateRelations);
  }

  updateEnd(time: Phaser.Time) {
    tickRelationsBackward(this.onUpdateRelations);
  }

  renderBegin(time: Phaser.Time) {
    tickRelationsForward(this.onRenderRelations);
  }

  renderEnd(time: Phaser.Time) {
    tickRelationsBackward(this.onRenderRelations);
  }
}

function tickRelationsBackward(relations: ExistenceRelation[]) {
  asSequence(relations).reverse().forEach(relation => relation.backwardTick());
}

function tickRelationsForward(relations: ExistenceRelation[]) {
  for (const relation of relations) {
    relation.forwardTick();
  }
}

export class ExistenceRelation<T = Component, U extends T & Entity = T & Entity> {
  constructor(
      private readonly system: ExistenceSystem<T>,
      private readonly entityFinder: EntityFinder<U>,
      private readonly enteringEntitiesList: Array<ReadonlyArray<T>> = [],
      private readonly exitingEntitiesList: Array<ReadonlyArray<T>> = []) {
    for (const entity of this.entityFinder) {
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

export default ExistenceEngine;
