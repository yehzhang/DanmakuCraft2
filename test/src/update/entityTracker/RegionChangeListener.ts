import {instance, mock, verify} from 'ts-mockito';
import EntityManager, {Region} from '../../../../src/entity/EntityManager';
import {ChunkEntityManager} from '../../../../src/entity/chunk';
import RegionChangeListener from '../../../../src/update/entityTracker/RegionChangeListener';
import {AnimatedEntity} from '../../../../src/entity/entity';

describe('RegionChangeListener', () => {
  let mockRegionChangeListener: RegionChangeListener;
  let mockEntityManager: EntityManager;
  let mockTrackee: AnimatedEntity;

  beforeEach(() => {
    mockRegionChangeListener = mock(RegionChangeListener);
    mockEntityManager = mock(ChunkEntityManager);
    mockTrackee = mock(AnimatedEntity);
  });

  it('calls stub methods with correct arguments', () => {
    let enteringRegions: Region[] = [mock(Region)];
    let exitingRegions: Region[] = [mock(Region)];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityManager,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['onEnter'](mockEntityManager, mockTrackee, enteringRegions))
        .once();
    verify(mockRegionChangeListener['onExit'](mockEntityManager, mockTrackee, exitingRegions))
        .once();
    verify(mockRegionChangeListener['onUpdate'](mockEntityManager, mockTrackee)).once();
  });

  it('calls stub methods correct number of times when regions are unchanged', () => {
    let enteringRegions: Region[] = [];
    let exitingRegions: Region[] = [];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityManager,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['onEnter'](mockEntityManager, mockTrackee, enteringRegions))
        .never();
    verify(mockRegionChangeListener['onExit'](mockEntityManager, mockTrackee, exitingRegions))
        .never();
    verify(mockRegionChangeListener['onUpdate'](mockEntityManager, mockTrackee)).never();
  });

  it('calls stub methods correct number of times when entering regions', () => {
    let enteringRegions: Region[] = [mock(Region)];
    let exitingRegions: Region[] = [];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityManager,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['onEnter'](mockEntityManager, mockTrackee, enteringRegions))
        .once();
    verify(mockRegionChangeListener['onExit'](mockEntityManager, mockTrackee, exitingRegions))
        .never();
    verify(mockRegionChangeListener['onUpdate'](mockEntityManager, mockTrackee)).once();
  });

  it('calls stub methods correct number of times when exiting regions', () => {
    let enteringRegions: Region[] = [];
    let exitingRegions: Region[] = [mock(Region)];

    RegionChangeListener.prototype.update.call(
        instance(mockRegionChangeListener),
        mockEntityManager,
        mockTrackee,
        enteringRegions,
        exitingRegions);

    verify(mockRegionChangeListener['onEnter'](mockEntityManager, mockTrackee, enteringRegions))
        .never();
    verify(mockRegionChangeListener['onExit'](mockEntityManager, mockTrackee, exitingRegions))
        .once();
    verify(mockRegionChangeListener['onUpdate'](mockEntityManager, mockTrackee)).once();
  });
});
