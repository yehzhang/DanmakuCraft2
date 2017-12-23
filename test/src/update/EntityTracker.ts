import {anything, deepEqual, instance, mock, resetCalls, verify, when} from 'ts-mockito';
import PhysicalConstants from '../../../src/PhysicalConstants';
import EntityFinder, {Region} from '../../../src/util/entityStorage/EntityFinder';
import ChunkEntityFinder from '../../../src/util/entityStorage/chunk/ChunkEntityFinder';
import {expect} from 'chai';
import {Point} from '../../../src/util/Point';
import {Player} from '../../../src/entitySystem/alias';
import EntityTracker from '../../../src/update/EntityTracker';

let mockTrackee: Player;
let mockEntityFinder: EntityFinder;
let mockRegionChangeListener: RegionChangeListener;
let mockTickListener: TickListener;
let trackee: Player;
let entityFinder: EntityFinder;
let regionChangeListener: RegionChangeListener;
let tickListener: TickListener;

beforeEach(() => {
  mockTrackee = mock(Player);
  mockEntityFinder = mock(ChunkEntityFinder);
  mockRegionChangeListener = mock(RegionChangeListener);
  mockTickListener = mock(NonPlayerCharacterTicker);
  trackee = instance(mockTrackee);
  entityFinder = instance(mockEntityFinder);
  regionChangeListener = instance(mockRegionChangeListener);
  tickListener = instance(mockTickListener);
});

describe('EntityTrackerBuilder', () => {
  it('properly builds', () => {
    let mockEntityFinder2 = mock(ChunkEntityFinder);
    let entityFinder2 = instance(mockEntityFinder2);
    let actualEntityTracker = EntityTracker.newBuilder(trackee, 1)
        .trackOnRegionChange(entityFinder, regionChangeListener)
        .trackOnRegionChange(entityFinder2, regionChangeListener)
        .trackOnRegionChange(entityFinder, regionChangeListener)
        .trackOnTick(entityFinder2, tickListener)
        .trackOnTick(entityFinder, tickListener)
        .trackOnTick(entityFinder2, tickListener)
        .build();

    let trackingRecords = new Map()
        .set(entityFinder, new TrackingRecord(entityFinder)
            .addRegionChangeListener(regionChangeListener)
            .addRegionChangeListener(regionChangeListener)
            .addTickListener(tickListener))
        .set(entityFinder2, new TrackingRecord(entityFinder2)
            .addRegionChangeListener(regionChangeListener)
            .addTickListener(tickListener)
            .addTickListener(tickListener));
    let expectedEntityTracker = new EntityTracker(trackee, 1, trackingRecords);

    expect(actualEntityTracker).to.deep.equal(expectedEntityTracker);
  });
});


describe('TrackingRecord', () => {
  let initialPosition: Point;

  beforeEach(() => {
    initialPosition = Point.origin();
    when(mockEntityFinder.listAround(initialPosition, 1)).thenReturn([]);
  });

  function createRegions(count: number) {
    let regions = [];
    for (let i = 0; i < count; i++) {
      regions.push(instance(mock(Region)));
    }
    return regions;
  }

  it('updates correct number of times', () => {
    new TrackingRecord(entityFinder).addRegionChangeListener(regionChangeListener)
        .update(trackee, initialPosition, 1);
    verify(mockRegionChangeListener.update(anything(), anything(), anything(), anything())).once();
  });

  it('updates with correct regions', () => {
    let trackingRecord = new TrackingRecord(entityFinder)
        .addRegionChangeListener(regionChangeListener);
    let regions = createRegions(10);
    when(mockEntityFinder.listAround(initialPosition, 1))
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
        entityFinder,
        trackee,
        deepEqual(regions.slice(0, 5)),
        deepEqual([]));
    let secondCall = mockRegionChangeListener.update(
        entityFinder,
        trackee,
        deepEqual(regions.slice(5, 7)),
        deepEqual(regions.slice(0, 2)));
    let thirdCall = mockRegionChangeListener.update(
        entityFinder,
        trackee,
        deepEqual(regions.slice(7, 10)),
        deepEqual(regions.slice(2, 7)));
    let fourthCall = mockRegionChangeListener.update(
        entityFinder,
        trackee,
        deepEqual([]),
        deepEqual(regions.slice(7, 10)));
    let fifthAndSixthCall = mockRegionChangeListener.update(
        entityFinder,
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
    new TrackingRecord(entityFinder).addRegionChangeListener(regionChangeListener)
        .addRegionChangeListener(regionChangeListener)
        .update(trackee, initialPosition, 1);
    verify(mockRegionChangeListener.update(anything(), anything(), anything(), anything())).twice();
  });

  it('ticks correct number of times', () => {
    new TrackingRecord(entityFinder).addTickListener(tickListener).tick(trackee);
    verify(mockTickListener.tick(anything(), anything())).once();
  });

  it('ticks with correct regions', () => {
    let trackingRecord = new TrackingRecord(entityFinder).addTickListener(tickListener);
    trackingRecord.tick(trackee);
    verify(mockTickListener.tick(trackee, deepEqual([]))).once();
    resetCalls(mockTickListener);

    let regions = createRegions(10);
    when(mockEntityFinder.listAround(initialPosition, 1))
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

    let firstCall = mockTickListener.tick(trackee, deepEqual(regions.slice(0, 5)));
    let secondCall = mockTickListener.tick(trackee, deepEqual(regions.slice(2, 7)));
    let thirdCall = mockTickListener.tick(trackee, deepEqual(regions.slice(7, 10)));
    let fourthAndFifthCall = mockTickListener.tick(trackee, deepEqual([]));
    verify(firstCall).calledBefore(secondCall);
    verify(secondCall).calledBefore(thirdCall);
    verify(thirdCall).calledBefore(fourthAndFifthCall);
    verify(fourthAndFifthCall).twice();
  });

  it('ticks all listeners', () => {
    new TrackingRecord(entityFinder).addTickListener(tickListener)
        .addTickListener(tickListener)
        .tick(trackee);
    verify(mockTickListener.tick(anything(), anything())).twice();
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
