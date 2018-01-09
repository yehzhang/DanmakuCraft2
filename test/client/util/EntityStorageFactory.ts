import EntityStorageFactoryImpl from '../../../client/src/util/entityStorage/EntityStorageFactoryImpl';
import {anything, instance, mock, when} from 'ts-mockito';
import EntityFactory from '../../../client/src/entitySystem/EntityFactory';
import EntityFactoryImpl from '../../../client/src/entitySystem/EntityFactoryImpl';
import Point from '../../../client/src/util/syntax/Point';
import ChunkEntityFinder from '../../../client/src/util/entityStorage/chunk/ChunkEntityFinder';
import {expect} from 'chai';
import PhysicalConstants from '../../../client/src/PhysicalConstants';

describe('EntityStorageFactoryImpl', () => {
  let factory: EntityStorageFactoryImpl;
  let mockEntityFactory: EntityFactory;
  let entityFactory: EntityFactory;

  beforeEach(() => {
    mockEntityFactory = mock(EntityFactoryImpl);
    entityFactory = instance(mockEntityFactory);

    factory = new EntityStorageFactoryImpl(entityFactory);

    when(mockEntityFactory.createRegion(anything())).thenCall(coordinates => coordinates.clone());
  });

  describe('creates Chunk Entity Storage correctly', () => {
    let entityFinder: ChunkEntityFinder<Point>;

    const CHUNKS_COUNT = 10;

    beforeEach(() => {
      let entityStorage = factory.createChunkEntityStorage(CHUNKS_COUNT);
      entityFinder = entityStorage.getFinder() as any;
    });

    it('with regard to chunks', () => {
      let chunks = entityFinder['chunks'];
      let expectedChunkSize = PhysicalConstants.WORLD_SIZE / CHUNKS_COUNT;
      expect(chunks['chunkSize']).to.equal(expectedChunkSize);

      let internalChunks = chunks['chunks'] as any as Point[][];
      for (let i = 0; i < CHUNKS_COUNT; i++) {
        for (let j = 0; j < CHUNKS_COUNT; j++) {
          expect(internalChunks[i][j].x).to.deep.equal(j * expectedChunkSize);
          expect(internalChunks[i][j].y).to.deep.equal(i * expectedChunkSize);
        }
      }
    });
  });
});
