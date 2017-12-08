import EntityTracker, {TrackingRecord} from '../../../../src/update/entityTracker/EntityTracker';
import {anything, deepEqual, instance, mock, resetCalls, verify, when} from 'ts-mockito';
import {Player} from '../../../../src/entity/entity';
import PhysicalConstants from '../../../../src/PhysicalConstants';
import EntityManager, {Region} from '../../../../src/entity/EntityManager';
import {ChunkEntityManager} from '../../../../src/entity/chunk';
import RegionChangeListener from '../../../../src/update/entityTracker/RegionChangeListener';
import TickListener from '../../../../src/update/entityTracker/TickListener';
import NonPlayerCharacterTicker from '../../../../src/update/NonPlayerCharacterTicker';
import {expect} from 'chai';
import {Point} from '../../util';

let mockTrackee: Player;
let mockEntityManager: EntityManager;
let mockRegionChangeListener: RegionChangeListener;
let mockTickListener: TickListener;
let trackee: Player;
let entityManager: EntityManager;
let regionChangeListener: RegionChangeListener;
let tickListener: TickListener;

beforeEach(() => {
  mockTrackee = mock(Player);
  mockEntityManager = mock(ChunkEntityManager);
  mockRegionChangeListener = mock(RegionChangeListener);
  mockTickListener = mock(NonPlayerCharacterTicker);
  trackee = instance(mockTrackee);
  entityManager = instance(mockEntityManager);
  regionChangeListener = instance(mockRegionChangeListener);
  tickListener = instance(mockTickListener);
});

describe('EntityTrackerBuilder', () => {
  it('properly builds', () => {
    let mockEntityManager2 = mock(ChunkEntityManager);
    let entityManager2 = instance(mockEntityManager2);
    let actualEntityTracker = EntityTracker.newBuilder(trackee, 1)
        .trackOnRegionChange(entityManager, regionChangeListener)
        .trackOnRegionChange(entityManager2, regionChangeListener)
        .trackOnRegionChange(entityManager, regionChangeListener)
        .trackOnTick(entityManager2, tickListener)
        .trackOnTick(entityManager, tickListener)
        .trackOnTick(entityManager2, tickListener)
        .build();

    let trackingRecords = new Map()
        .set(entityManager, new TrackingRecord(entityManager)
            .addRegionChangeListener(regionChangeListener)
            .addRegionChangeListener(regionChangeListener)
            .addTickListener(tickListener))
        .set(entityManager2, new TrackingRecord(entityManager2)
            .addRegionChangeListener(regionChangeListener)
            .addTickListener(tickListener)
            .addTickListener(tickListener));
    let expectedEntityTracker = new EntityTracker(trackee, 1, trackingRecords);

    expect(actualEntityTracker).to.deep.equal(expectedEntityTracker);
  });
});


describe('TrackingRecord', () => {
  let initialPosition: Phaser.Point;

  beforeEach(() => {
    initialPosition = Point.origin();
    when(mockEntityManager.listAround(initialPosition, 1)).thenReturn([]);
  });

  function createRegions(count: number) {
    let regions = [];
    for (let i = 0; i < count; i++) {
      regions.push(instance(mock(Region)));
    }
    return regions;
  }

  it('updates correct number of times', () => {
    new TrackingRecord(entityManager).addRegionChangeListener(regionChangeListener)
        .update(trackee, initialPosition, 1);
    verify(mockRegionChangeListener.update(anything(), anything(), anything(), anything())).once();
  });

  it('updates with correct regions', () => {
    let trackingRecord = new TrackingRecord(entityManager)
        .addRegionChangeListener(regionChangeListener);
    let regions = createRegions(10);
    when(mockEntityManager.listAround(initialPosition, 1))
        .thenReturn(regions.slice(0, 5))
        .thenReturn(regions.slice(2, 7))
        .thenReturn(regions.slice(7, 10))
        .thenReturn([]);

    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.update(trackee, initialPosition, 1);

    let firstCall = mockRegionChangeListener.update(
        entityManager,
        trackee,
        deepEqual(regions.slice(0, 5)),
        deepEqual([]));
    let secondCall = mockRegionChangeListener.update(
        entityManager,
        trackee,
        deepEqual(regions.slice(5, 7)),
        deepEqual(regions.slice(0, 2)));
    let thirdCall = mockRegionChangeListener.update(
        entityManager,
        trackee,
        deepEqual(regions.slice(7, 10)),
        deepEqual(regions.slice(2, 7)));
    let fourthCall = mockRegionChangeListener.update(
        entityManager,
        trackee,
        deepEqual([]),
        deepEqual(regions.slice(7, 10)));
    let fifthAndSixthCall = mockRegionChangeListener.update(
        entityManager,
        trackee,
        deepEqual([]),
        deepEqual([]));
    verify(firstCall).calledBefore(secondCall);
    verify(secondCall).calledBefore(thirdCall);
    verify(thirdCall).calledBefore(fourthCall);
    verify(fourthCall).calledBefore(fifthAndSixthCall);
    verify(fifthAndSixthCall).twice();
  });

  it('updates all listeners', () => {
    new TrackingRecord(entityManager).addRegionChangeListener(regionChangeListener)
        .addRegionChangeListener(regionChangeListener)
        .update(trackee, initialPosition, 1);
    verify(mockRegionChangeListener.update(anything(), anything(), anything(), anything())).twice();
  });

  it('ticks correct number of times', () => {
    new TrackingRecord(entityManager).addTickListener(tickListener).tick(trackee);
    verify(mockTickListener.onTick(anything(), anything())).once();
  });

  it('ticks with correct regions', () => {
    let trackingRecord = new TrackingRecord(entityManager).addTickListener(tickListener);
    trackingRecord.tick(trackee);
    verify(mockTickListener.onTick(trackee, deepEqual([]))).once();
    resetCalls(mockTickListener);

    let regions = createRegions(10);
    when(mockEntityManager.listAround(initialPosition, 1))
        .thenReturn(regions.slice(0, 5))
        .thenReturn(regions.slice(2, 7))
        .thenReturn(regions.slice(7, 10))
        .thenReturn([]);

    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.tick(trackee);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.tick(trackee);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.tick(trackee);
    trackingRecord.update(trackee, initialPosition, 1);
    trackingRecord.tick(trackee);
    trackingRecord.tick(trackee);

    let firstCall = mockTickListener.onTick(trackee, deepEqual(regions.slice(0, 5)));
    let secondCall = mockTickListener.onTick(trackee, deepEqual(regions.slice(2, 7)));
    let thirdCall = mockTickListener.onTick(trackee, deepEqual(regions.slice(7, 10)));
    let fourthAndFifthCall = mockTickListener.onTick(trackee, deepEqual([]));
    verify(firstCall).calledBefore(secondCall);
    verify(secondCall).calledBefore(thirdCall);
    verify(thirdCall).calledBefore(fourthAndFifthCall);
    verify(fourthAndFifthCall).twice();
  });

  it('ticks all listeners', () => {
    new TrackingRecord(entityManager).addTickListener(tickListener)
        .addTickListener(tickListener)
        .tick(trackee);
    verify(mockTickListener.onTick(anything(), anything())).twice();
  });
});

describe('EntityTracker', () => {
  it('validates negative sampling radius', () => {
    expect(() => new EntityTracker(trackee, -1, new Map())).to.throw();
  });

  it('validates oversized sampling radius', () => {
    let ignored = new EntityTracker(trackee, PhysicalConstants.WORLD_SIZE / 2, new Map());
    expect(() => new EntityTracker(trackee, PhysicalConstants.WORLD_SIZE / 2 + 1, new Map()))
        .to.throw();
  });
});
