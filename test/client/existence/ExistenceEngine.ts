import {
  default as ExistenceEngine,
  ExistenceRelation
} from '../../../client/src/engine/existence/ExistenceEngine';
import EntityFinder, {ExistenceUpdatedEvent} from '../../../client/src/util/entityStorage/EntityFinder';
import ExistenceSystem from '../../../client/src/entitySystem/system/existence/ExistenceSystem';
import Entity from '../../../client/src/entitySystem/Entity';
import {anything, instance, mock, resetCalls, verify, when} from 'ts-mockito';
import AddChildToRegionSystem from '../../../client/src/entitySystem/system/existence/AddChildToRegionSystem';
import Iterator from '../../../client/src/util/syntax/Iterator';
import {expect} from 'chai';
import ChunkEntityFinder from '../../../client/src/util/entityStorage/chunk/ChunkEntityFinder';
import {Phaser} from '../../../client/src/util/alias/phaser';

describe('ExistenceEngine', () => {
  let engine: ExistenceEngine;
  let onRenderRelations: ExistenceRelation[];
  let onUpdateRelations: ExistenceRelation[];

  beforeEach(() => {
    onUpdateRelations = [mock(ExistenceRelation), mock(ExistenceRelation)];
    onRenderRelations = [mock(ExistenceRelation), mock(ExistenceRelation)];

    engine = new ExistenceEngine(onUpdateRelations.map(instance), onRenderRelations.map(instance));
  });

  it('should tick relations in order on update.', () => {
    engine.update();

    verify(onUpdateRelations[1].backwardTick()).calledBefore(onUpdateRelations[0].backwardTick());
    verify(onUpdateRelations[0].backwardTick()).calledBefore(onUpdateRelations[0].forwardTick());
    verify(onUpdateRelations[0].forwardTick()).calledBefore(onUpdateRelations[1].forwardTick());
    verify(onRenderRelations[0].forwardTick()).never();
    verify(onRenderRelations[1].forwardTick()).never();
    verify(onRenderRelations[0].backwardTick()).never();
    verify(onRenderRelations[1].backwardTick()).never();
  });

  it('should tick relations in order on render.', () => {
    engine.render();

    verify(onRenderRelations[1].backwardTick()).calledBefore(onRenderRelations[0].backwardTick());
    verify(onRenderRelations[0].backwardTick()).calledBefore(onRenderRelations[0].forwardTick());
    verify(onRenderRelations[0].forwardTick()).calledBefore(onRenderRelations[1].forwardTick());
    verify(onUpdateRelations[0].forwardTick()).never();
    verify(onUpdateRelations[1].forwardTick()).never();
    verify(onUpdateRelations[0].backwardTick()).never();
    verify(onUpdateRelations[1].backwardTick()).never();
  });
});

describe('ExistenceRelation', () => {
  let relation: ExistenceRelation;
  let mockSystem: ExistenceSystem<Entity>;
  let mockEntityFinder: EntityFinder<Entity>;
  let enteringEntities: Entity[][];
  let exitingEntities: Entity[][];
  let entityFinder: EntityFinder<Entity>;

  beforeEach(() => {
    mockSystem = mock(AddChildToRegionSystem);
    let mockEnteringEntities = [mock(Entity), mock(Entity)];
    enteringEntities = [mockEnteringEntities.map(instance)];
    let mockExitingEntities = [mock(Entity), mock(Entity)];
    exitingEntities = [mockExitingEntities.map(instance)];
    mockEntityFinder = mock(ChunkEntityFinder);
    entityFinder = instance(mockEntityFinder);
    entityFinder[Symbol.iterator] = () => Iterator.of([]);

    when(mockEntityFinder.entityExistenceUpdated).thenReturn(new Phaser.Signal());
    mockEntityFinder[Symbol.iterator] = () => Iterator.of([]);

    relation = new ExistenceRelation(
        instance(mockSystem),
        entityFinder,
        Array.from(enteringEntities),
        Array.from(exitingEntities));
  });

  it('should apply system to entering entities.', () => {
    relation.forwardTick();

    verify(mockSystem.adopt(enteringEntities[0][0])).once();
    verify(mockSystem.adopt(enteringEntities[0][1])).once();
    verify(mockSystem.abandon(anything())).never();
  });

  it('should apply system to exiting entities.', () => {
    relation.backwardTick();

    verify(mockSystem.abandon(exitingEntities[0][0])).once();
    verify(mockSystem.abandon(exitingEntities[0][1])).once();
    verify(mockSystem.adopt(anything())).never();
  });

  it('should not reapply system on a second tick.', () => {
    relation.forwardTick();
    relation.backwardTick();
    resetCalls(mockSystem);
    relation.forwardTick();
    relation.backwardTick();

    verify(mockSystem.adopt(anything())).never();
    verify(mockSystem.abandon(anything())).never();
  });

  it('should apply system to all entities on initialization.', () => {
    entityFinder[Symbol.iterator] = () => Iterator.of(enteringEntities[0]);

    relation = new ExistenceRelation(instance(mockSystem), entityFinder);

    verify(mockSystem.adopt(enteringEntities[0][0])).once();
    verify(mockSystem.adopt(enteringEntities[0][1])).once();
    verify(mockSystem.abandon(anything())).never();
  });

  it('should update on signal.', () => {
    let signal: Phaser.Signal<ExistenceUpdatedEvent<Entity>> = new Phaser.Signal();
    when(mockEntityFinder.entityExistenceUpdated).thenReturn(signal);

    let relation2 = new ExistenceRelation(instance(mockSystem), entityFinder);
    signal.dispatch(
        new ExistenceUpdatedEvent(enteringEntities[0], exitingEntities[0]));

    expect(relation2).to.deep.equal(relation);
  });
});
