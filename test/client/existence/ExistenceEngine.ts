import {expect} from 'chai';
import {anything, instance, mock, resetCalls, verify, when} from 'ts-mockito';
import {default as ExistenceEngine, ExistenceRelation} from '../../../client/src/engine/existence/ExistenceEngine';
import Entity from '../../../client/src/entitySystem/Entity';
import AddChildToRegionSystem from '../../../client/src/entitySystem/system/existence/AddChildToRegionSystem';
import ExistenceSystem from '../../../client/src/entitySystem/system/existence/ExistenceSystem';
import {Phaser} from '../../../client/src/util/alias/phaser';
import ChunkEntityFinder from '../../../client/src/util/entityStorage/chunk/ChunkEntityFinder';
import EntityFinder, {StateChanged} from '../../../client/src/util/entityStorage/EntityFinder';
import Iterator from '../../../client/src/util/syntax/Iterator';

describe('ExistenceEngine', () => {
  let engine: ExistenceEngine;
  let onRenderRelations: ExistenceRelation[];
  let onUpdateRelations: ExistenceRelation[];
  let time: Phaser.Time;

  beforeEach(() => {
    onUpdateRelations = [mock(ExistenceRelation), mock(ExistenceRelation)];
    onRenderRelations = [mock(ExistenceRelation), mock(ExistenceRelation)];
    time = instance(mock(Phaser.Time));

    engine = new ExistenceEngine(onUpdateRelations.map(instance), onRenderRelations.map(instance));
  });

  it('should tick relations in order on update.', () => {
    engine.updateBegin(time);

    verify(onUpdateRelations[0].backwardTick()).never();
    verify(onUpdateRelations[1].backwardTick()).never();
    verify(onUpdateRelations[0].forwardTick()).once();
    verify(onUpdateRelations[1].forwardTick()).once();
    verify(onUpdateRelations[0].forwardTick()).calledBefore(onUpdateRelations[1].forwardTick());

    verify(onRenderRelations[0].forwardTick()).never();
    verify(onRenderRelations[1].forwardTick()).never();
    verify(onRenderRelations[0].backwardTick()).never();
    verify(onRenderRelations[1].backwardTick()).never();

    resetCalls(onUpdateRelations[0]);
    resetCalls(onUpdateRelations[1]);

    engine.updateEnd(time);

    verify(onUpdateRelations[0].forwardTick()).never();
    verify(onUpdateRelations[1].forwardTick()).never();
    verify(onUpdateRelations[0].backwardTick()).once();
    verify(onUpdateRelations[1].backwardTick()).once();
    verify(onUpdateRelations[1].backwardTick()).calledBefore(onUpdateRelations[0].backwardTick());

    verify(onRenderRelations[0].forwardTick()).never();
    verify(onRenderRelations[1].forwardTick()).never();
    verify(onRenderRelations[0].backwardTick()).never();
    verify(onRenderRelations[1].backwardTick()).never();
  });

  it('should tick relations in order on render.', () => {
    engine.renderBegin(time);

    verify(onRenderRelations[0].backwardTick()).never();
    verify(onRenderRelations[1].backwardTick()).never();
    verify(onRenderRelations[0].forwardTick()).once();
    verify(onRenderRelations[1].forwardTick()).once();
    verify(onRenderRelations[0].forwardTick()).calledBefore(onRenderRelations[1].forwardTick());

    verify(onUpdateRelations[0].forwardTick()).never();
    verify(onUpdateRelations[1].forwardTick()).never();
    verify(onUpdateRelations[0].backwardTick()).never();
    verify(onUpdateRelations[1].backwardTick()).never();

    resetCalls(onRenderRelations[0]);
    resetCalls(onRenderRelations[1]);

    engine.renderEnd(time);

    verify(onRenderRelations[0].forwardTick()).never();
    verify(onRenderRelations[1].forwardTick()).never();
    verify(onRenderRelations[0].backwardTick()).once();
    verify(onRenderRelations[1].backwardTick()).once();
    verify(onRenderRelations[1].backwardTick()).calledBefore(onRenderRelations[0].backwardTick());

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
    const mockEnteringEntities = [mock(Entity), mock(Entity)];
    enteringEntities = [mockEnteringEntities.map(instance)];
    const mockExitingEntities = [mock(Entity), mock(Entity)];
    exitingEntities = [mockExitingEntities.map(instance)];
    mockEntityFinder = mock(ChunkEntityFinder);
    entityFinder = instance(mockEntityFinder);
    entityFinder[Symbol.iterator] = () => Iterator.of([]);

    when(mockEntityFinder.onStateChanged).thenReturn(new Phaser.Signal());
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
    const signal: Phaser.Signal<StateChanged<Entity>> = new Phaser.Signal();
    when(mockEntityFinder.onStateChanged).thenReturn(signal);

    const relation2 = new ExistenceRelation(instance(mockSystem), entityFinder);
    signal.dispatch(
        new StateChanged(enteringEntities[0], exitingEntities[0]));

    expect(relation2).to.deep.equal(relation);
  });
});
