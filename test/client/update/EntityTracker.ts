import {anything, deepEqual, instance, mock, verify, when} from 'ts-mockito';
import {expect} from 'chai';
import Point from '../../../client/src/util/syntax/Point';
import Entity from '../../../client/src/entitySystem/Entity';
import DynamicProvider from '../../../client/src/util/DynamicProvider';
import EntityTracker, {
  DistanceChecker, EntityFinderRecord, SystemTicker,
  TickSystemTicker
} from '../../../client/src/update/EntityTracker';
import Distance from '../../../client/src/util/math/Distance';
import {Phaser} from '../../../client/src/util/alias/phaser';
import EntityFinder, {VisibilityUpdatedEvent} from '../../../client/src/util/entityStorage/EntityFinder';
import ChunkEntityFinder from '../../../client/src/util/entityStorage/chunk/ChunkEntityFinder';

const NEXT_SAMPLING_RADIUS = 10;
const NEXT_COORDINATES = Point.of(100, 100);

describe('EntityTracker', () => {
  let mockTrackee: Entity;
  let mockSamplingRadius: DynamicProvider<number>;
  let mockSystemTickers: SystemTicker[];
  let systemTickers: SystemTicker[];
  let mockEntityFinderRecords: Array<EntityFinderRecord<Entity>>;
  let mockDistanceChecker: DistanceChecker;
  let mockDistance: Distance;
  let time: Phaser.Time;
  let entityTracker: EntityTracker;
  let currentCoordinates: Point;
  let entityFinderRecords: Array<EntityFinderRecord<Entity>>;

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
    systemTickers = mockSystemTickers.map(instance);
    entityFinderRecords = mockEntityFinderRecords.map(instance);

    when(mockTrackee.coordinates).thenReturn(NEXT_COORDINATES);
    when(mockSamplingRadius.getValue()).thenReturn(NEXT_SAMPLING_RADIUS);
    when(mockDistanceChecker.updatingDistance).thenReturn(instance(mockDistance));

    entityTracker = new EntityTracker(
        instance(mockTrackee),
        instance(mockSamplingRadius),
        systemTickers,
        [],
        entityFinderRecords,
        instance(mockDistanceChecker),
        currentCoordinates);
  });

  it('should update all records when out of update radius', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(false);

    entityTracker.update(time);

    verify(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).once();
    verify(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).once();
    verify(mockEntityFinderRecords[0].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[1].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should update all records when sampling radius is changed', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockSamplingRadius.hasUpdate()).thenReturn(true);

    entityTracker.update(time);

    verify(mockSamplingRadius.hasUpdate()).once();
    verify(mockEntityFinderRecords[0].shouldUpdate(anything(), anything())).never();
    verify(mockEntityFinderRecords[1].shouldUpdate(anything(), anything())).never();
    verify(mockEntityFinderRecords[0].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[1].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should only update records that returns true from shouldUpdate()', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockEntityFinderRecords[1].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn(true);

    entityTracker.update(time);

    verify(mockEntityFinderRecords[0].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[1].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
    verify(mockEntityFinderRecords[0].update(anything(), anything())).never();
    verify(mockEntityFinderRecords[1].update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS)).once();
  });

  it('should update tickers once for each procedure', () => {
    entityTracker.update(time);

    verify(mockSystemTickers[0].firstForwardTick(time)).once();
    verify(mockSystemTickers[1].firstForwardTick(time)).once();
    verify(mockSystemTickers[0].backwardTick(time)).once();
    verify(mockSystemTickers[1].backwardTick(time)).once();
    verify(mockSystemTickers[0].secondForwardTick(time)).once();
    verify(mockSystemTickers[1].secondForwardTick(time)).once();
  });

  it('should update tickers in order', () => {
    entityTracker.update(time);

    verify(mockSystemTickers[1].backwardTick(time))
        .calledBefore(mockSystemTickers[0].backwardTick(time));
    verify(mockSystemTickers[0].backwardTick(time))
        .calledBefore(mockSystemTickers[0].firstForwardTick(time));
    verify(mockSystemTickers[0].firstForwardTick(time))
        .calledBefore(mockSystemTickers[1].firstForwardTick(time));
    verify(mockSystemTickers[1].firstForwardTick(time))
        .calledBefore(mockSystemTickers[0].secondForwardTick(time));
    verify(mockSystemTickers[0].secondForwardTick(time))
        .calledBefore(mockSystemTickers[1].secondForwardTick(time));
  });

  it('should update current coordinates when out of updating radius', () => {
    entityTracker.update(time);
    expect(currentCoordinates).to.deep.equal(NEXT_COORDINATES);
  });

  it('should update current coordinates when sampling radius is changed', () => {
    when(mockSamplingRadius.hasUpdate()).thenReturn(true);

    entityTracker.update(time);

    expect(currentCoordinates).to.deep.equal(NEXT_COORDINATES);
  });

  it('should not update current coordinates when not all entity finder records are updated', () => {
    when(mockDistance.isClose(NEXT_COORDINATES, deepEqual(currentCoordinates))).thenReturn(true);
    when(mockEntityFinderRecords[0].shouldUpdate(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS))
        .thenReturn(true);

    entityTracker.update(time);

    expect(currentCoordinates).to.deep.equal(Point.origin());
  });

  it('should commit sampling radius changes', () => {
    when(mockSamplingRadius.hasUpdate()).thenReturn(true);

    entityTracker.update(time);

    verify(mockSamplingRadius.commitUpdate()).once();
  });
});

describe('EntityFinderRecord', () => {
  let entityFinderRecord: EntityFinderRecord<Entity>;
  let mockEntityFinder: EntityFinder<Entity>;
  let mockDistanceChecker: DistanceChecker;
  let entities: Entity[];
  let entityVisibilityUpdated: Phaser.Signal;

  beforeEach(() => {
    entityVisibilityUpdated = new Phaser.Signal();

    mockEntityFinder = mock(ChunkEntityFinder);
    when(mockEntityFinder.listAround(anything(), anything())).thenReturn([]);
    when(mockEntityFinder.entityVisibilityUpdated).thenReturn(entityVisibilityUpdated);

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
    entityVisibilityUpdated.dispatch(new VisibilityUpdatedEvent([entities[3]], []));
    verify(mockDistanceChecker.isInEnteringRadius(entities[3])).once();
  });

  it('should not be updated immediately after an update', () => {
    let record = new EntityFinderRecord(instance(mockEntityFinder), instance(mockDistanceChecker));

    record.update(NEXT_COORDINATES, NEXT_SAMPLING_RADIUS);

    expect(record.shouldUpdate(Point.origin(), 0)).to.be.false;
  });

  it('should be updated when an entity is registered nearby', () => {
    when(mockDistanceChecker.isInEnteringRadius(entities[3])).thenReturn(true);

    entityVisibilityUpdated.dispatch(new VisibilityUpdatedEvent([entities[3]], []));

    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.true;
  });

  it('should not be updated when an entity is registered faraway', () => {
    entityVisibilityUpdated.dispatch(new VisibilityUpdatedEvent([entities[3]], []));
    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.false;
  });

  it('should be updated when a current entity is deregistered', () => {
    entityFinderRecord.currentEntities.add(entities[3]);

    entityVisibilityUpdated.dispatch(new VisibilityUpdatedEvent([], [entities[3]]));

    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.true;
  });

  it('should not be updated when a non-current entity is deregistered', () => {
    entityVisibilityUpdated.dispatch(new VisibilityUpdatedEvent([], [entities[3]]));
    expect(entityFinderRecord.shouldUpdate(Point.origin(), 0)).to.be.false;
  });

  // TODO should do the same things in pre render
  // TODO should commit update after pre render
});
