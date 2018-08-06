import {expect} from 'chai';
import {instance, mock, when} from 'ts-mockito';
import {StationaryEntity} from '../../../client/src/entitySystem/alias';
import Display from '../../../client/src/entitySystem/component/Display';
import MutableCoordinates from '../../../client/src/entitySystem/component/MutableCoordinates';
import Entity from '../../../client/src/entitySystem/Entity';
import {Phaser, PIXI} from '../../../client/src/util/alias/phaser';
import ArrayCollector from '../../../client/src/util/dataStructures/ArrayCollector';
import Quadtree from '../../../client/src/util/dataStructures/Quadtree';
import EntityStorage from '../../../client/src/util/entityStorage/EntityStorage';
import GlobalEntityStorage from '../../../client/src/util/entityStorage/GlobalEntityStorage';
import QuadtreeEntityStorage from '../../../client/src/util/entityStorage/QuadtreeEntityStorage';
import Point from '../../../client/src/util/syntax/Point';
import Rectangle from '../../../client/src/util/syntax/Rectangle';

function TestEntity() {
}

TestEntity.prototype = Object.getPrototypeOf(Entity.newBuilder()
    .mix(new MutableCoordinates(Point.origin()))
    .mix(new Display(new PIXI.DisplayObjectContainer()))
    .build());

type TestEntity = StationaryEntity & Display;

type TestSignal = Phaser.Signal<ReadonlyArray<TestEntity>>;

function describeEntityStorage(
    subject: string,
    createEntityStorage: (
        onEntitiesRegistered: TestSignal,
        onEntitiesDeregistered: TestSignal) => EntityStorage<TestEntity>,
    fuzzyCollect: boolean) {
  let entityStorage: EntityStorage<TestEntity>;
  let collector: ArrayCollector<TestEntity>;
  let mockEntities: TestEntity[];
  let entities: TestEntity[];
  let onEntitiesRegistered: TestSignal;
  let onEntitiesDeregistered: TestSignal;

  beforeEach(() => {
    onEntitiesRegistered = new Phaser.Signal();
    onEntitiesDeregistered = new Phaser.Signal();
    entityStorage = createEntityStorage(onEntitiesRegistered, onEntitiesDeregistered);
    collector = new ArrayCollector();
    mockEntities = [mock(TestEntity), mock(TestEntity)];
    entities = mockEntities.map(instance);

    when(mockEntities[0].coordinates).thenReturn(Point.origin());
    when(mockEntities[0].getDisplayWorldBounds()).thenReturn(Rectangle.empty());
    when(mockEntities[1].coordinates).thenReturn(Point.of(3, 4));
    when(mockEntities[1].getDisplayWorldBounds()).thenReturn(Rectangle.of(3, 4, 0, 0));
  });

  describe(subject, () => {
    it('should be empty initially', () => {
      expect(Array.from(entityStorage)).to.be.empty;
    });

    it('should register an entity', () => {
      entityStorage.register(entities[0]);
      expect(Array.from(entityStorage)).to.deep.equal([entities[0]]);
    });

    it('should not re-register an entity', () => {
      entityStorage.register(entities[0]);
      entityStorage.register(entities[0]);

      expect(Array.from(entityStorage)).to.deep.equal([entities[0]]);
    });

    it('should dispatch signal on an entity registered', () => {
      let dispatchedEntities = null;
      onEntitiesRegistered.add(value => dispatchedEntities = value);
      entityStorage.register(entities[0]);

      expect(dispatchedEntities).to.deep.equal([entities[0]]);
    });

    it('should not dispatch signal on an entity re-registered', () => {
      entityStorage.register(entities[0]);
      let dispatchedEntities = null;
      onEntitiesRegistered.add(value => dispatchedEntities = value);
      entityStorage.register(entities[0]);

      expect(dispatchedEntities).to.be.null;
    });

    it('should register entities', () => {
      entityStorage.registerBatch(entities);
      expect(Array.from(entityStorage).sort()).to.deep.equal(entities.sort());
    });

    it('should not re-register entities', () => {
      entityStorage.registerBatch(entities);
      entityStorage.registerBatch(entities);

      expect(Array.from(entityStorage).sort()).to.deep.equal(entities.sort());
    });

    it('should not register empty entities', () => {
      entityStorage.registerBatch(entities);
      entityStorage.registerBatch([]);

      expect(Array.from(entityStorage).sort()).to.deep.equal(entities.sort());
    });

    it('should dispatch signal on entities registered', () => {
      let dispatchedEntities: any = [];
      onEntitiesRegistered.add(value => dispatchedEntities = value);
      entityStorage.registerBatch(entities);

      expect(dispatchedEntities.sort()).to.deep.equal(entities.sort());
    });

    it('should not dispatch signal on entities re-registered', () => {
      entityStorage.registerBatch(entities);
      let dispatchedEntities = null;
      onEntitiesRegistered.add(value => dispatchedEntities = value);
      entityStorage.registerBatch(entities);

      expect(dispatchedEntities).to.be.null;
    });

    it('should not dispatch signal on empty entities registered', () => {
      entityStorage.registerBatch(entities);
      let dispatchedEntities = null;
      onEntitiesRegistered.add(value => dispatchedEntities = value);
      entityStorage.registerBatch([]);

      expect(dispatchedEntities).to.be.null;
    });

    it('should deregister an entity', () => {
      entityStorage.register(entities[0]);
      entityStorage.deregister(entities[0]);

      expect(Array.from(entityStorage)).to.be.empty;
    });

    it('should not deregister an un-registered entity', () => {
      entityStorage.register(entities[0]);
      entityStorage.deregister(entities[1]);

      expect(Array.from(entityStorage)).to.be.deep.equal([entities[0]]);
    });

    it('should dispatch signal on an entity deregistered', () => {
      entityStorage.register(entities[0]);
      let dispatchedEntities = null;
      onEntitiesDeregistered.add(value => dispatchedEntities = value);
      entityStorage.deregister(entities[0]);

      expect(dispatchedEntities).to.deep.equal([entities[0]]);
    });

    it('should not dispatch signal on an un-registered entity deregistered', () => {
      let dispatchedEntities = null;
      onEntitiesDeregistered.add(value => dispatchedEntities = value);
      entityStorage.register(entities[0]);
      entityStorage.deregister(entities[1]);

      expect(dispatchedEntities).to.be.null;
    });

    it('should not collect if radius is 0', () => {
      entityStorage.registerBatch(entities);
      entityStorage.collectAround(Point.origin(), 0, collector);

      expect(collector.values).to.be.empty;
    });

    it('should collect entities in range', () => {
      entityStorage.registerBatch(entities);
      entityStorage.collectAround(Point.origin(), 5 + 1e-6, collector);

      expect(collector.values).to.deep.equal(entities);
    });

    it('should collect entities in range when center is not origin', () => {
      entityStorage.registerBatch(entities);
      entityStorage.collectAround(Point.of(4, 3), 5 + 1e-6, collector);

      expect(collector.values).to.deep.equal(entities);
    });

    if (fuzzyCollect) {
      return;
    }

    it('should not collect entities on range', () => {
      entityStorage.registerBatch(entities);
      entityStorage.collectAround(Point.origin(), 5, collector);

      expect(collector.values).to.deep.equal([entities[0]]);
    });

    it('should not collect entities on range when center is not origin', () => {
      entityStorage.registerBatch(entities);
      entityStorage.collectAround(Point.of(4, 3), 5, collector);

      expect(collector.values).to.deep.equal([entities[1]]);
    });
  });
}

describeEntityStorage(
    'GlobalEntityStorage',
    (onEntitiesRegistered, onEntitiesDeregistered) =>
        new GlobalEntityStorage(undefined, onEntitiesRegistered, onEntitiesDeregistered),
    /* fuzzyCollect */ false);

describeEntityStorage(
    'QuadtreeEntityStorage',
    (onEntitiesRegistered, onEntitiesDeregistered) => new QuadtreeEntityStorage(
        Quadtree.create(7, 8),
        onEntitiesRegistered,
        onEntitiesDeregistered),
    /* fuzzyCollect */ true);
