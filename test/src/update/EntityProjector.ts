import EntityProjector from '../../../src/update/EntityProjector';
import {expect} from 'chai';
import EntityManager, {Region} from '../../../src/entity/EntityManager';
import {anything, deepEqual, instance, mock, verify, when} from 'ts-mockito';
import {ChunkEntityManager} from '../../../src/entity/chunk';
import {Player} from '../../../src/entity/entity';

describe('EntityProjector', () => {
  let entityProjector: EntityProjector;
  let mockEntityManager: EntityManager;
  let entityManager: EntityManager;
  let mockTrackee: Player;
  let trackee: Player;
  let mockRegions: Region[];
  let regions: Region[];

  beforeEach(() => {
    entityProjector = new EntityProjector();
    mockEntityManager = mock(ChunkEntityManager);
    entityManager = instance(mockEntityManager);
    mockTrackee = mock(Player);
    trackee = instance(mockTrackee);
    mockRegions = [
      mockRegion(),
      mockRegion(),
      mockRegion()];
    regions = mockRegions.map(instance);
  });

  function mockRegion() {
    let regionMock = mock(Region);
    when(regionMock.measure()).thenReturn(new PIXI.DisplayObjectContainer());
    return regionMock;
  }

  it('has no children in container initially', () => {
    expect(entityProjector.display().children).to.be.empty;
  });

  it('adds displays of entering regions to container on update', () => {
    entityProjector.update(entityManager, trackee, regions.slice(0, 1), []);

    expect(entityProjector.display().children).to.have.members(
        regions.slice(0, 1).map(region => region.measure()));

    entityProjector.update(entityManager, trackee, regions.slice(1, 3), []);

    expect(entityProjector.display().children).to.have.members(
        regions.map(region => region.measure()));
  });

  it('removes displays of exiting regions from container on update', () => {
    entityProjector.update(entityManager, trackee, regions, []);
    entityProjector.update(entityManager, trackee, [], regions.slice(0, 1));

    expect(entityProjector.display().children).to.have.members(
        regions.slice(1, 3).map(region => region.measure()));

    entityProjector.update(entityManager, trackee, [], regions.slice(1, 3));

    expect(entityProjector.display().children).to.be.empty;
  });

  it('decoheres all entering regions', () => {
    entityProjector.update(entityManager, trackee, regions, []);

    verify(mockRegions[0].decohere(anything())).called();
    verify(mockRegions[1].decohere(anything())).called();
    verify(mockRegions[2].decohere(anything())).called();
  });

  it('decoheres a region correctly', () => {
    entityProjector.update(entityManager, trackee, [regions[0]], []);

    verify(mockRegions[0].decohere(deepEqual(new Phaser.Point()))).once();
    verify(mockRegions[0].decohere(deepEqual(new Phaser.Point())))
        .calledBefore(mockRegions[0].measure());
    verify(mockRegions[0].measure()).once();
  });

  it('coheres all leaving regions', () => {
    entityProjector.update(entityManager, trackee, [], regions);

    verify(mockRegions[0].cohere()).called();
    verify(mockRegions[1].cohere()).called();
    verify(mockRegions[2].cohere()).called();
  });

  it('coheres a region correctly', () => {
    entityProjector.update(entityManager, trackee, [], [regions[0]]);

    verify(mockRegions[0].measure()).once();
    verify(mockRegions[0].measure()).calledBefore(mockRegions[0].cohere());
    verify(mockRegions[0].cohere()).once();
  });
});
