import {Point} from '../util';
import {Chunk, ChunkEntityManager} from '../../../src/entity/chunk';
import {SuperposedEntity} from '../../../src/entity/entity';
import PhysicalConstants from '../../../src/PhysicalConstants';
import {expect} from 'chai';
import {instance, mock, when} from 'ts-mockito';
import {Region} from '../../../src/entity/EntityManager';

describe('ChunkEntityManager', () => {
  let entityManager: ChunkEntityManager<SuperposedEntity>;

  const CHUNKS_COUNT = 10;
  const CHUNKS_SIZE = PhysicalConstants.WORLD_SIZE / CHUNKS_COUNT;

  beforeEach(() => {
    entityManager = new ChunkEntityManager(CHUNKS_COUNT);
  });

  function chunkAt(x: number, y: number) {
    return entityManager['getChunk'](x, y);
  }

  function flatten<T>(arrays: T[][]): T[] {
    return [].concat.apply([], arrays);
  }

  it('validates arguments', () => {
    expect(() => new ChunkEntityManager(-1)).to.throw();

    let chunkEntityManager = new ChunkEntityManager(1.1);
    expect(chunkEntityManager['chunks']).to.have.lengthOf(1);
    expect(chunkEntityManager['chunks'][0]).to.have.lengthOf(1);
  });

  it('isInSameRegion() works', () => {
    expect(entityManager.isInSameRegion(Point.origin(), Point.origin())).to.be.true;
    expect(entityManager.isInSameRegion(Point.origin(), Point.of(-1, 0))).to.be.false;
    expect(entityManager.isInSameRegion(Point.origin(), Point.of(0, -1))).to.be.false;
    expect(entityManager.isInSameRegion(Point.origin(), Point.of(-1, -1))).to.be.false;

    expect(entityManager.isInSameRegion(Point.of(-1, -1), Point.origin())).to.be.false;
    expect(entityManager.isInSameRegion(Point.of(-1, -1), Point.of(-1, 0))).to.be.false;
    expect(entityManager.isInSameRegion(Point.of(-1, -1), Point.of(0, -1))).to.be.false;
    expect(entityManager.isInSameRegion(Point.of(-1, -1), Point.of(-1, -1))).to.be.true;

    expect(entityManager.isInSameRegion(Point.origin(), Point.of(0, 1))).to.be.true;
    expect(entityManager.isInSameRegion(Point.origin(), Point.of(1, 0))).to.be.true;
    expect(entityManager.isInSameRegion(Point.origin(), Point.of(1, 1))).to.be.true;

    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE - 1))).to.be.true;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE, CHUNKS_SIZE - 1))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE, CHUNKS_SIZE))).to.be.false;

    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE - 1))).to.be.true;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE, CHUNKS_SIZE - 1))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(CHUNKS_SIZE, CHUNKS_SIZE))).to.be.false;

    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE - 1))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE))).to.be.true;

    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(PhysicalConstants.WORLD_SIZE - 1, 0))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(PhysicalConstants.WORLD_SIZE, 0))).to.be.true;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(0, PhysicalConstants.WORLD_SIZE - 1))).to.be.false;
    expect(entityManager.isInSameRegion(
        Point.origin(),
        Point.of(0, PhysicalConstants.WORLD_SIZE))).to.be.true;
  });

  it('load() and loads() work', () => {
    let coordinates = [
      Point.origin(),
      Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE - 1),
      Point.of(CHUNKS_SIZE, CHUNKS_SIZE),
      Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1),
      Point.of(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE),
    ];
    let entities = [];
    for (let coordinate of coordinates) {
      let mockEntity = mock(SuperposedEntity);
      when(mockEntity.getCoordinate()).thenReturn(coordinate);
      entities.push(instance(mockEntity));
    }

    entityManager.loadBatch(entities);

    expect(chunkAt(0, 0)['entities']).to.include(entities[0]);
    expect(chunkAt(0, 0)['entities']).to.include(entities[1]);
    expect(chunkAt(1, 1)['entities']).to.include(entities[2]);
    expect(chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1)['entities'])
        .to.include(entities[3]);
    expect(chunkAt(0, 0)['entities']).to.include(entities[4]);
  });

  it('forEach() works', () => {
    let chunks = entityManager['chunks'];
    entityManager.forEach((chunk, index) => {
      let x = index % CHUNKS_COUNT;
      let y = Math.floor(index / CHUNKS_COUNT);
      expect(chunk).to.equal(chunks[y][x]);
    });
  });

  it('listAround() works', () => {
    expect(entityManager.listAround(Point.origin(), 0)).to.deep.equal([]);

    expect(entityManager.listAround(Point.of(1, 1), 1)).to.have.members([chunkAt(0, 0)]);
    expect(entityManager.listAround(Point.of(2, 2), 2)).to.have.members([chunkAt(0, 0)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE - 2, CHUNKS_SIZE / 2), 1))
        .to.have.members([chunkAt(0, 0)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE / 2, 1), 1))
        .to.have.members([chunkAt(0, 0)]);
    expect(entityManager.listAround(
        Point.of(CHUNKS_SIZE / 2 - 1, CHUNKS_SIZE / 2 - 1), CHUNKS_SIZE / 2 - 1))
        .to.have.members([chunkAt(0, 0)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE - 2, CHUNKS_SIZE - 2), 1))
        .to.have.members([chunkAt(0, 0)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE - 1), 1))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0), chunkAt(0, 1), chunkAt(1, 1)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE - 2, CHUNKS_SIZE - 2), 2))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0), chunkAt(0, 1), chunkAt(1, 1)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE / 2, CHUNKS_SIZE / 2), CHUNKS_SIZE / 2))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0), chunkAt(0, 1), chunkAt(1, 1)]);
    expect(entityManager.listAround(
        Point.of(CHUNKS_SIZE / 2 + CHUNKS_SIZE, CHUNKS_SIZE / 2 + CHUNKS_SIZE),
        CHUNKS_SIZE / 2 + 1)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(1, 0),
          chunkAt(0, 1),
          chunkAt(1, 1),
          chunkAt(2, 0),
          chunkAt(2, 1),
          chunkAt(2, 2),
          chunkAt(1, 2),
          chunkAt(0, 2)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE / 2, CHUNKS_SIZE - 1), 1))
        .to.have.members([chunkAt(0, 0), chunkAt(0, 1)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE - 2, CHUNKS_SIZE / 2), 2))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE + 2, CHUNKS_SIZE + 1), 1))
        .to.have.members([chunkAt(1, 1)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE + 2, CHUNKS_SIZE + 1), 2))
        .to.have.members([chunkAt(1, 1), chunkAt(1, 0)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE + 2, CHUNKS_SIZE + 1), 3))
        .to.have.members([chunkAt(1, 1), chunkAt(1, 0), chunkAt(0, 0), chunkAt(0, 1)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE, CHUNKS_SIZE), CHUNKS_SIZE - 1))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0), chunkAt(0, 1), chunkAt(1, 1)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE, CHUNKS_SIZE), CHUNKS_SIZE)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(1, 0),
          chunkAt(0, 1),
          chunkAt(1, 1),
          chunkAt(2, 0),
          chunkAt(2, 1),
          chunkAt(2, 2),
          chunkAt(1, 2),
          chunkAt(0, 2)]);

    expect(entityManager.listAround(
        Point.of(PhysicalConstants.WORLD_SIZE - 2, PhysicalConstants.WORLD_SIZE - 2), 1))
        .to.have.members([chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1)]);
    expect(entityManager.listAround(Point.of(PhysicalConstants.WORLD_SIZE - 2, 1), 1))
        .to.have.members([chunkAt(CHUNKS_COUNT - 1, 0)]);

    expect(entityManager.listAround(
        Point.of(PhysicalConstants.WORLD_SIZE / 2 - 1, PhysicalConstants.WORLD_SIZE / 2 - 1),
        PhysicalConstants.WORLD_SIZE / 2 - 1))
        .to.have.lengthOf(CHUNKS_COUNT ** 2)
        .and.have.members(flatten(entityManager['chunks']));

    expect(entityManager.listAround(Point.of(0, 1), 1))
        .to.have.members([chunkAt(0, 0), chunkAt(CHUNKS_COUNT - 1, 0)]);
    expect(entityManager.listAround(Point.of(1, 0), 1))
        .to.have.members([chunkAt(0, 0), chunkAt(0, CHUNKS_COUNT - 1)]);

    expect(entityManager.listAround(Point.origin(), 1)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(0, CHUNKS_COUNT - 1)]);
    expect(entityManager.listAround(
        Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1), 1)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(0, CHUNKS_COUNT - 1)]);

    expect(entityManager.listAround(Point.of(PhysicalConstants.WORLD_SIZE - 1, 2), 1))
        .to.have.members([chunkAt(0, 0), chunkAt(CHUNKS_COUNT - 1, 0)]);
    expect(entityManager.listAround(Point.of(PhysicalConstants.WORLD_SIZE - 1, 2), 2)).to.have
        .members([chunkAt(0, 0), chunkAt(CHUNKS_COUNT - 1, 0)]);
    expect(entityManager.listAround(Point.of(2, PhysicalConstants.WORLD_SIZE - 1), 2)).to.have
        .members([chunkAt(0, 0), chunkAt(0, CHUNKS_COUNT - 1)]);
    expect(entityManager.listAround(Point.of(PhysicalConstants.WORLD_SIZE - 1, 2), 3)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(0, CHUNKS_COUNT - 1)]);
    expect(entityManager.listAround(Point.of(2, PhysicalConstants.WORLD_SIZE - 1), 3)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(0, CHUNKS_COUNT - 1)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE, 0), 1)).to.have
        .members([
          chunkAt(1, 0),
          chunkAt(0, 0),
          chunkAt(1, CHUNKS_COUNT - 1),
          chunkAt(0, CHUNKS_COUNT - 1)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE, 0), CHUNKS_SIZE - 1)).to.have
        .members([
          chunkAt(1, 0),
          chunkAt(0, 0),
          chunkAt(1, CHUNKS_COUNT - 1),
          chunkAt(0, CHUNKS_COUNT - 1)]);
    expect(entityManager.listAround(Point.of(CHUNKS_SIZE, 0), CHUNKS_SIZE)).to.have
        .members([
          chunkAt(1, 0),
          chunkAt(0, 0),
          chunkAt(0, 1),
          chunkAt(1, 1),
          chunkAt(2, 0),
          chunkAt(2, 1),
          chunkAt(0, CHUNKS_COUNT - 1),
          chunkAt(1, CHUNKS_COUNT - 1),
          chunkAt(2, CHUNKS_COUNT - 1)]);

    expect(entityManager.listAround(Point.of(CHUNKS_SIZE - 1, 0), CHUNKS_SIZE)).to.have
        .members([
          chunkAt(1, 0),
          chunkAt(0, 0),
          chunkAt(0, 1),
          chunkAt(1, 1),
          chunkAt(0, CHUNKS_COUNT - 1),
          chunkAt(1, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(CHUNKS_COUNT - 1, 1)]);
    expect(entityManager.listAround(
        Point.of(CHUNKS_SIZE / 2, CHUNKS_SIZE / 2), CHUNKS_SIZE / 2 + 1)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(1, 0),
          chunkAt(0, 1),
          chunkAt(1, 1),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(0, CHUNKS_COUNT - 1),
          chunkAt(1, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(CHUNKS_COUNT - 1, 1)]);

    expect(entityManager.listAround(
        Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1),
        CHUNKS_SIZE)).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 2, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 2),
          chunkAt(CHUNKS_COUNT - 2, CHUNKS_COUNT - 2),
          chunkAt(0, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(0, CHUNKS_COUNT - 2),
          chunkAt(CHUNKS_COUNT - 2, 0),
        ]);

    expect(entityManager.listAround(Point.origin(), PhysicalConstants.WORLD_SIZE / 2))
        .to.have.lengthOf(CHUNKS_COUNT ** 2)
        .and.have.members(flatten(entityManager['chunks']));
    expect(entityManager.listAround(
        Point.origin(), (PhysicalConstants.WORLD_SIZE) / 2 - CHUNKS_SIZE + 1))
        .to.have.lengthOf(CHUNKS_COUNT ** 2)
        .and.have.members(flatten(entityManager['chunks']));
    expect(entityManager.listAround(
        Point.origin(), (PhysicalConstants.WORLD_SIZE) / 2 - CHUNKS_SIZE))
        .to.have.lengthOf((CHUNKS_COUNT - 1) ** 2);
  });

  it('listAround() validates arguments', () => {
    expect(() => entityManager.listAround(Point.origin(), -1)).to.throw();

    let ignored = entityManager.listAround(Point.origin(), PhysicalConstants.WORLD_SIZE / 2);
    expect(() => entityManager.listAround(Point.origin(), PhysicalConstants.WORLD_SIZE / 2 + 1))
        .to.throw();
  });
});

describe('Region', () => {
  let mockEntities: SuperposedEntity[];
  let entities: SuperposedEntity[];
  let chunk: Chunk<SuperposedEntity>;

  beforeEach(() => {
    mockEntities = [
      mock(SuperposedEntity),
      mock(SuperposedEntity),
      mock(SuperposedEntity)];
    entities = mockEntities.map(instance);
    chunk = new Chunk(Point.origin());
  });

  it('countEntities() works', () => {
    expect(chunk.countEntities()).to.equal(0);

    chunk.loadEntity(entities[0]);
    expect(chunk.countEntities()).to.equal(1);

    chunk.loadEntity(entities[1]);
    expect(chunk.countEntities()).to.equal(2);

    chunk.loadEntity(entities[2]);
    expect(chunk.countEntities()).to.equal(3);
  });

  it('loadEntity() discards duplicate entities', () => {
    chunk.loadEntity(entities[0]);
    chunk.loadEntity(entities[0]);

    expect(chunk.countEntities()).to.equal(1);
  });
});
