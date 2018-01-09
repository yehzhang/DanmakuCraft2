import {anything, deepEqual, instance, mock, verify, when} from 'ts-mockito';
import EntityTracker, {
  DistanceChecker, EntityFinderRecord, SystemTicker, TickSystemTicker,
  UpdateRelation
} from '../../../src/update/EntityTracker';
import Entity from '../../../src/entitySystem/Entity';
import DynamicProvider from '../../../src/util/DynamicProvider';
import Distance from '../../../src/util/math/Distance';
import {expect} from 'chai';
import Point from '../../../src/util/syntax/Point';
import EntityFinder, {EntityExistenceUpdatedEvent} from '../../../src/util/entityStorage/EntityFinder';
import ChunkEntityFinder from '../../../src/util/entityStorage/chunk/ChunkEntityFinder';

const NEXT_SAMPLING_RADIUS = 10;
const NEXT_COORDINATES = Point.of(100, 100);

describe('EntityTracker', () => {
  let mockTrackee: Entity;
  let mockSamplingRadius: DynamicProvider<number>;
  let mockSystemTickers: Array<SystemTicker<Entity>>;
  let mockEntityFinderRecords: Array<EntityFinderRecord<Entity>>;
  let mockUpdateRelations: Array<UpdateRelation<Entity, Entity>>;
  let mockDistanceChecker: DistanceChecker;
  let mockDistance: Distance;
  let time: Phaser.Time;
  let entityTracker: EntityTracker;
  let currentCoordinates: Point;
  let systemTickers: Array<SystemTicker<Entity>>;
  let entityFinderRecords: Array<EntityFinderRecord<Entity>>;
  let updateRelations: Array<UpdateRelation<Entity, Entity>>;

  beforeEach(() => {
    currentCoordinates = Point.origin();
    mockTrackee = mock(Entity);
    mockSamplingRadius = mock(DynamicProvider);
    mockEntityFinderRecords = [
      mock(EntityFinderRecord),
      mock(EntityFinderRecord)];
    mockDistance = mock(Distance);
    mockDistanceChecker = mock(DistanceChecker);
    time = instance(mock(Phaser.Time));
    mockSystemTickers = [
      mock(TickSystemTicker),
      mock(TickSystemTicker)
    ];
    mockUpdateRelations = [
      mock(UpdateRelation),
      mock(UpdateRelation),
    ];
    systemTickers = mockSystemTickers.map(instance);
    entityFinderRecords = mockEntityFinderRecords.map(instance);
    updateRelations = mockUpdateRelations.map(instance);

    when(mockTrackee.coordinates).thenReturn(NEXT_COORDINATES);
    when(mockSamplingRadius.getValue()).thenReturn(NEXT_SAMPLING_RADIUS);
    when(mockDistanceChecker.updatingDistance).thenReturn(instance(mockDistance));

    entityTracker = new EntityTracker(
        instance(mockTrackee),
        instance(mockSamplingRadius),
        systemTickers,
        entityFinderRecords,
        updateRelations,
        instance(mockDistanceChecker),
        currentCoordinates);
  });

  it('should update all records when out of update radius', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(false);

    entityTracker.tick(time);

    verify(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).once();
    verify(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).once();
    verify(mockEntityFinderRecords[0].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[1].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should update all records when sampling radius is changed', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockSamplingRadius.hasUpdate()).thenReturn(true);

    entityTracker.tick(time);

    verify(mockSamplingRadius.hasUpdate()).once();
    verify(mockEntityFinderRecords[0].hasUpdate()).never();
    verify(mockEntityFinderRecords[1].hasUpdate()).never();
    verify(mockEntityFinderRecords[0].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[1].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should only update records that returns true from shouldUpdate()', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockEntityFinderRecords[1].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn(true);

    entityTracker.tick(time);

    verify(mockEntityFinderRecords[0].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[1].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[0].update(anything(), anything())).never();
    verify(mockEntityFinderRecords[1].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should update tickers once for each procedure', () => {
    entityTracker.tick(time);

    verify(mockUpdateRelations[0].forwardTick(time)).once();
    verify(mockUpdateRelations[1].forwardTick(time)).once();
    verify(mockUpdateRelations[0].backwardTick(time)).once();
    verify(mockUpdateRelations[1].backwardTick(time)).once();
    verify(mockSystemTickers[0].finishingTick(time)).once();
    verify(mockSystemTickers[1].finishingTick(time)).once();
  });

  it('should update tickers in order', () => {
    entityTracker.tick(time);

    verify(mockUpdateRelations[0].forwardTick(time))
        .calledBefore(mockUpdateRelations[1].forwardTick(time));
    verify(mockUpdateRelations[1].forwardTick(time))
        .calledBefore(mockUpdateRelations[1].backwardTick(time));
    verify(mockUpdateRelations[1].backwardTick(time))
        .calledBefore(mockUpdateRelations[0].backwardTick(time));
    verify(mockUpdateRelations[0].backwardTick(time))
        .calledBefore(mockSystemTickers[0].finishingTick(time));
    verify(mockSystemTickers[0].finishingTick(time))
        .calledBefore(mockSystemTickers[1].finishingTick(time));
  });

  it(`should commit entity finder records' updates`, () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockEntityFinderRecords[1].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn(true);

    entityTracker.tick(time);


    verify(mockEntityFinderRecords[0].commitUpdate()).never();
    verify(mockEntityFinderRecords[1].commitUpdate()).once();
  });

  it('should update current coordinates when out of updating radius', () => {
    entityTracker.tick(time);
    expect(currentCoordinates).to.deep.equal(NEXT_COORDINATES);
  });

  it('should update current coordinates when sampling radius is changed', () => {
    when(mockSamplingRadius.hasUpdate()).thenReturn(true);

    entityTracker.tick(time);

    expect(currentCoordinates).to.deep.equal(NEXT_COORDINATES);
  });

  it('should not update current coordinates when not all entity finder records are updated', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockEntityFinderRecords[0].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn(true);

    entityTracker.tick(time);

    expect(currentCoordinates).to.deep.equal(Point.origin());
  });

  it('should commit sampling radius changes', () => {
    when(mockSamplingRadius.hasUpdate()).thenReturn(true);

    entityTracker.tick(time);

    verify(mockSamplingRadius.commitUpdate()).once();
  });
});

describe('EntityFinderRecord', () => {
  let entityFinderRecord: EntityFinderRecord<Entity>;
  let mockEntityFinder: EntityFinder<Entity>;
  let mockDistanceChecker: DistanceChecker;
  let entities: Entity[];
  let entityExistenceUpdated: Phaser.Signal;

  beforeEach(() => {
    entityExistenceUpdated = new Phaser.Signal();

    mockEntityFinder = mock(ChunkEntityFinder);
    when(mockEntityFinder.listAround(anything(), anything())).thenReturn([]);
    when(mockEntityFinder.entityExistenceUpdated).thenReturn(entityExistenceUpdated);

    mockDistanceChecker = mock(DistanceChecker);

    entities = [
      instance(mock(Entity)),
      instance(mock(Entity)),
      instance(mock(Entity)),
      instance(mock(Entity))];

    entityFinderRecord = new EntityFinderRecord(
        instance(mockEntityFinder),
        instance(mockDistanceChecker),
        new Set([entities[0], entities[1]]),
        [],
        [],
        false);
  });

  it('should be updated initially', () => {
    let record = new EntityFinderRecord(instance(mockEntityFinder), instance(mockDistanceChecker));
    expect(record.shouldUpdate(Point.origin(), 0)).to.be.true;
  });

  it('should list entities from entity finder', () => {
    when(mockEntityFinder.listAround(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).thenReturn([]);

    entityFinderRecord.update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS);

    verify(mockEntityFinder.listAround(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should correctly select entering entities', () => {
    when(mockEntityFinder.listAround(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn([entities[1], entities[2]]);

    entityFinderRecord.update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS);

    expect(entityFinderRecord.enteringEntities).to.deep.equal([entities[2]]);
  });

  it('should correctly select exiting entities', () => {
    when(mockEntityFinder.listAround(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn([entities[1], entities[2]]);

    entityFinderRecord.update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS);

    expect(entityFinderRecord.exitingEntities).to.deep.equal([entities[0]]);
  });

  it('should correctly retain entities', () => {
    when(mockEntityFinder.listAround(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn([entities[1], entities[2]]);

    entityFinderRecord.update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS);

    expect(entityFinderRecord.currentEntities).to.deep.equal(new Set([entities[1], entities[2]]));
  });

  it('should check if a registered entity needs update', () => {
    entityExistenceUpdated.dispatch(new EntityExistenceUpdatedEvent(entities[3], null));
    verify(mockDistanceChecker.isInEnteringRadius(entities[3])).once();
  });

  it('should not be updated immediately after an update', () => {
    let record = new EntityFinderRecord(instance(mockEntityFinder), instance(mockDistanceChecker));

    record.update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS);

    expect(record.shouldUpdate(Point.origin(), 0)).to.be.false;
  });

  it('should be updated when an entity is registered nearby', () => {
    when(mockDistanceChecker.isInEnteringRadius(entities[3])).thenReturn(true);

    entityExistenceUpdated.dispatch(new EntityExistenceUpdatedEvent(entities[3], null));

    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.true;
  });

  it('should not be updated when an entity is registered faraway', () => {
    entityExistenceUpdated.dispatch(new EntityExistenceUpdatedEvent(entities[3], null));
    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.false;
  });

  it('should be updated when a current entity is deregistered', () => {
    entityFinderRecord.currentEntities.add(entities[3]);

    entityExistenceUpdated.dispatch(new EntityExistenceUpdatedEvent(null, entities[3]));

    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.true;
  });

  it('should not be updated when a non-current entity is deregistered', () => {
    entityExistenceUpdated.dispatch(new EntityExistenceUpdatedEvent(null, entities[3]));
    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.false;
  });

  it('should clear states after commit', () => {
    let record = new EntityFinderRecord(
        instance(mockEntityFinder),
        instance(mockDistanceChecker),
        new Set([entities[0], entities[1]]),
        [entities[2]],
        [entities[3]],
        true,
        true);
    record.commitUpdate();

    expect(record.enteringEntities).to.deep.equal([]);
    expect(record.exitingEntities).to.deep.equal([]);
    expect(record.currentEntities).to.deep.equal(new Set([entities[0], entities[1]]));
    expect(record['shouldUpdateEntities']).to.be.true;
    expect(record['hasUpdatedEntities']).to.be.false;
  });
});
