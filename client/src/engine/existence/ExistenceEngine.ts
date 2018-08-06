import {Component} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import ExistenceSystem from '../../entitySystem/system/existence/ExistenceSystem';
import EntityFinder from '../../util/entityStorage/EntityFinder';
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
  // noinspection TsLint
  for (var relationIndex = relations.length - 1; relationIndex >= 0; --relationIndex) {
    relations[relationIndex].backwardTick();
  }
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

    this.entityFinder.onEntitiesRegistered.add(
        entities => this.enteringEntitiesList.push(entities));
    this.entityFinder.onEntitiesDeregistered.add(
        entities => this.exitingEntitiesList.push(entities));
  }

  forwardTick() {
    for (const enteringEntities of this.enteringEntitiesList) {
      for (const entity of enteringEntities) {
        this.system.adopt(entity);
      }
    }
    this.enteringEntitiesList.length = 0;
  }

  backwardTick() {
    for (const exitingEntities of this.exitingEntitiesList) {
      for (const entity of exitingEntities) {
        this.system.abandon(entity);
      }
    }
    this.exitingEntitiesList.length = 0;
  }
}

export default ExistenceEngine;
