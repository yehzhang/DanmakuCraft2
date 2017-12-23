import {instance, mock, verify} from 'ts-mockito';
import EntityFinder, {Region} from '../../../src/util/entityStorage/EntityFinder';
import ChunkEntityFinder from '../../../src/util/entityStorage/chunk/ChunkEntityFinder';
import RegionChangeListener from '../../../../src/update/entityTracker/RegionChangeListener';
import AnimatedEntity from '../../../../src/entity/Updatable';

describe('RegionChangeListener', () => {
  let mockRegionChangeListener: RegionChangeListener;
  let mockEntityFinder: EntityFinder;
  let mockTrackee: AnimatedEntity;

  beforeEach(() => {
    mockRegionChangeListener = mock(RegionChangeListener);
    mockEntityFinder = mock(ChunkEntityFinder);
    mockTrackee = mock(AnimatedEntity);
  });

  it('calls stub methods with correct arguments', () => {
    let enteringRegions: Region[] = [mock(Region)];
    let exitingRegions: Region[] = [mock(Region)];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityFinder,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['enter'](mockEntityFinder, mockTrackee, enteringRegions))
        .once();
    verify(mockRegionChangeListener['exit'](mockEntityFinder, mockTrackee, exitingRegions))
        .once();
    verify(mockRegionChangeListener['onUpdate'](mockEntityFinder, mockTrackee)).once();
  });

  it('calls stub methods correct number of times when regions are unchanged', () => {
    let enteringRegions: Region[] = [];
    let exitingRegions: Region[] = [];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityFinder,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['enter'](mockEntityFinder, mockTrackee, enteringRegions))
        .never();
    verify(mockRegionChangeListener['exit'](mockEntityFinder, mockTrackee, exitingRegions))
        .never();
    verify(mockRegionChangeListener['onUpdate'](mockEntityFinder, mockTrackee)).never();
  });

  it('calls stub methods correct number of times when entering regions', () => {
    let enteringRegions: Region[] = [mock(Region)];
    let exitingRegions: Region[] = [];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityFinder,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['enter'](mockEntityFinder, mockTrackee, enteringRegions))
        .once();
    verify(mockRegionChangeListener['exit'](mockEntityFinder, mockTrackee, exitingRegions))
        .never();
    verify(mockRegionChangeListener['onUpdate'](mockEntityFinder, mockTrackee)).once();
  });

  it('calls stub methods correct number of times when exiting regions', () => {
    let enteringRegions: Region[] = [];
    let exitingRegions: Region[] = [mock(Region)];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityFinder,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['enter'](mockEntityFinder, mockTrackee, enteringRegions))
        .never();
    verify(mockRegionChangeListener['exit'](mockEntityFinder, mockTrackee, exitingRegions))
        .once();
    verify(mockRegionChangeListener['onUpdate'](mockEntityFinder, mockTrackee)).once();
  });
});
