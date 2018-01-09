import PhysicalConstants from '../../../client/src/PhysicalConstants';
import {expect} from 'chai';
import Chunks from '../../../client/src/util/entityStorage/chunk/Chunks';
import Point from '../../../client/src/util/syntax/Point';
import Rectangle from '../../../client/src/util/syntax/Rectangle';

describe('Chunks', () => {
  let chunks: Chunks<object>;
  let chunkObjects: object[][];

  const CHUNKS_COUNT = 10;
  const CHUNKS_SIZE = PhysicalConstants.WORLD_SIZE / CHUNKS_COUNT;

  beforeEach(() => {
    chunkObjects = [];
    for (let i = 0; i < CHUNKS_COUNT; i++) {
      chunkObjects.push([]);
      for (let j = 0; j < CHUNKS_COUNT; j++) {
        chunkObjects[i].push({x: j, y: i});
      }
    }
    chunks = new Chunks(chunkObjects, CHUNKS_SIZE);
  });

  function chunkAt(x: number, y: number) {
    return chunkObjects[y][x];
  }

  function flatten<T>(arrays: T[][]): T[] {
    return [].concat.apply([], arrays);
  }

  it('validates arguments', () => {
    expect(() => new Chunks([[1]], 0)).to.throw();

    expect(() => new Chunks([[]], 1)).to.throw();

    expect(() => new Chunks([], 1)).to.throw();

    expect(() => new Chunks([[1], []], 1)).to.throw();

    expect(() => new Chunks([[1], [1, 2]], 1)).to.throw();
  });

  it('iteration works', () => {
    let chunkIndex = 0;
    for (let chunk of chunks) {
      let x = chunkIndex % CHUNKS_COUNT;
      let y = Math.floor(chunkIndex / CHUNKS_COUNT);
      expect(chunk).to.equal(chunkAt(x, y));

      chunkIndex++;
    }
  });

  it('getChunkByCoordinates() works', () => {
    expect(chunks.getChunkByCoordinates(Point.of(0, 0))).to.equal(chunkAt(0, 0));
    expect(chunks.getChunkByCoordinates(Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE - 1)))
        .to.equal(chunkAt(0, 0));

    expect(chunks.getChunkByCoordinates(Point.of(CHUNKS_SIZE, CHUNKS_SIZE - 1)))
        .to.equal(chunkAt(1, 0));
    expect(chunks.getChunkByCoordinates(Point.of(CHUNKS_SIZE - 1, CHUNKS_SIZE)))
        .to.equal(chunkAt(0, 1));
    expect(chunks.getChunkByCoordinates(Point.of(CHUNKS_SIZE, CHUNKS_SIZE)))
        .to.equal(chunkAt(1, 1));

    expect(chunks.getChunkByCoordinates(
        Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1)))
        .to.equal(chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1));

    expect(chunks.getChunkByCoordinates(
        Point.of(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE)))
        .to.equal(chunkAt(0, 0));
    expect(chunks.getChunkByCoordinates(Point.of(
        PhysicalConstants.WORLD_SIZE + CHUNKS_SIZE,
        PhysicalConstants.WORLD_SIZE + CHUNKS_SIZE - 1))).to.equal(chunkAt(1, 0));
    expect(chunks.getChunkByCoordinates(Point.of(PhysicalConstants.WORLD_SIZE, 0)))
        .to.equal(chunkAt(0, 0));
    expect(chunks.getChunkByCoordinates(Point.of(PhysicalConstants.WORLD_SIZE - 1, 0)))
        .to.equal(chunkAt(CHUNKS_COUNT - 1, 0));

    expect(chunks.getChunkByCoordinates(Point.of(-1, 0))).to.equal(chunkAt(CHUNKS_COUNT - 1, 0));
    expect(chunks.getChunkByCoordinates(Point.of(0, -1)))
        .to.equal(chunkAt(0, CHUNKS_COUNT - 1));

    expect(chunks.getChunkByCoordinates(Point.of(-PhysicalConstants.WORLD_SIZE, 0)))
        .to.equal(chunkAt(0, 0));
    expect(chunks.getChunkByCoordinates(Point.of(-PhysicalConstants.WORLD_SIZE - 1, 0)))
        .to.equal(chunkAt(CHUNKS_COUNT - 1, 0));
    expect(chunks.getChunkByCoordinates(Point.of(-PhysicalConstants.WORLD_SIZE + CHUNKS_SIZE - 1, 0)))
        .to.equal(chunkAt(0, 0));
    expect(chunks.getChunkByCoordinates(Point.of(-PhysicalConstants.WORLD_SIZE + CHUNKS_SIZE, 0)))
        .to.equal(chunkAt(1, 0));
  });

  it('listChunksInBounds() works', () => {
    expect(chunks.listChunksInBounds(Rectangle.empty())).to.deep.equal([]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, 0, 1))).to.deep.equal([]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, 1, 0))).to.deep.equal([]);

    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, 1, 1))).to.have.members([chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, 2, 2))).to.have.members([chunkAt(0, 0)]);

    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, CHUNKS_SIZE - 1, 1)))
        .to.have.members([chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, 1, CHUNKS_SIZE - 1)))
        .to.have.members([chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, CHUNKS_SIZE, 1)))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, 1, CHUNKS_SIZE)))
        .to.have.members([chunkAt(0, 0), chunkAt(0, 1)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, CHUNKS_SIZE, CHUNKS_SIZE)))
        .to.have.members([chunkAt(0, 0), chunkAt(0, 1), chunkAt(1, 0), chunkAt(1, 1)]);

    expect(chunks.listChunksInBounds(Rectangle.of(1, 0, CHUNKS_SIZE - 1, 1)))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(CHUNKS_SIZE - 1, 0, 1, 1)))
        .to.have.members([chunkAt(0, 0), chunkAt(1, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(CHUNKS_SIZE, 0, 1, 1)))
        .to.have.members([chunkAt(1, 0)]);

    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, CHUNKS_SIZE * 2 - 1, CHUNKS_SIZE)))
        .to.have.members([chunkAt(0, 0), chunkAt(0, 1), chunkAt(1, 0), chunkAt(1, 1)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, CHUNKS_SIZE * 2, CHUNKS_SIZE))).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(0, 1),
          chunkAt(1, 0),
          chunkAt(1, 1),
          chunkAt(2, 0),
          chunkAt(2, 1)]);
    expect(chunks.listChunksInBounds(Rectangle.of(0, 0, CHUNKS_SIZE * 2, CHUNKS_SIZE * 2))).to.have
        .members([
          chunkAt(0, 0),
          chunkAt(0, 1),
          chunkAt(1, 0),
          chunkAt(1, 1),
          chunkAt(2, 0),
          chunkAt(2, 1),
          chunkAt(2, 2),
          chunkAt(1, 2),
          chunkAt(0, 2)]);

    expect(chunks.listChunksInBounds(Rectangle.of(PhysicalConstants.WORLD_SIZE - 2, 0, 1, 1)))
        .to.have.members([chunkAt(CHUNKS_COUNT - 1, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(PhysicalConstants.WORLD_SIZE - 2, 0, 2, 1)))
        .to.have.members([chunkAt(CHUNKS_COUNT - 1, 0), chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(
        Rectangle.of(PhysicalConstants.WORLD_SIZE - 2, PhysicalConstants.WORLD_SIZE - 2, 2, 2)))
        .to.have
        .members([
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(0, 0),
          chunkAt(0, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1)]);

    expect(chunks.listChunksInBounds(Rectangle.of(PhysicalConstants.WORLD_SIZE * 2, 0, 1, 1)))
        .to.have.members([chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(PhysicalConstants.WORLD_SIZE * 2 - 2, 0, 1, 1)))
        .to.have.members([chunkAt(CHUNKS_COUNT - 1, 0)]);

    expect(chunks.listChunksInBounds(Rectangle.of(-1, -1, 1, 1))).to.have
        .members([
          chunkAt(CHUNKS_COUNT - 1, 0),
          chunkAt(0, 0),
          chunkAt(0, CHUNKS_COUNT - 1),
          chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1)]);
    expect(chunks.listChunksInBounds(Rectangle.of(-2, -2, 1, 1))).to.have
        .members([chunkAt(CHUNKS_COUNT - 1, CHUNKS_COUNT - 1)]);

    expect(chunks.listChunksInBounds(Rectangle.of(
        -PhysicalConstants.WORLD_SIZE,
        -PhysicalConstants.WORLD_SIZE,
        1,
        1))).to.have.members([chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(
        -PhysicalConstants.WORLD_SIZE * 2,
        -PhysicalConstants.WORLD_SIZE * 2,
        1,
        1))).to.have.members([chunkAt(0, 0)]);
    expect(chunks.listChunksInBounds(Rectangle.of(
        -PhysicalConstants.WORLD_SIZE * 2 - 2,
        -PhysicalConstants.WORLD_SIZE * 2,
        1,
        1))).to.have.members([chunkAt(CHUNKS_COUNT - 1, 0)]);

    expect(chunks.listChunksInBounds(Rectangle.of(
        0,
        0,
        PhysicalConstants.WORLD_SIZE,
        PhysicalConstants.WORLD_SIZE))).to.have.members(flatten(chunkObjects));
    expect(chunks.listChunksInBounds(Rectangle.of(
        PhysicalConstants.WORLD_SIZE / 2,
        PhysicalConstants.WORLD_SIZE / 2,
        PhysicalConstants.WORLD_SIZE,
        PhysicalConstants.WORLD_SIZE))).to.have.members(flatten(chunkObjects));

    expect(chunks.listChunksInBounds(Rectangle.of(
        0,
        0,
        PhysicalConstants.WORLD_SIZE,
        PhysicalConstants.WORLD_SIZE - CHUNKS_SIZE))).to.have.members(flatten(chunkObjects));
    expect(chunks.listChunksInBounds(Rectangle.of(
        0,
        0,
        PhysicalConstants.WORLD_SIZE,
        PhysicalConstants.WORLD_SIZE - CHUNKS_SIZE - 1)))
        .to.have.members(flatten(chunkObjects.slice(0, CHUNKS_COUNT - 1)));
  });

  it('listChunksInBounds() validates arguments', () => {
    expect(() => chunks.listChunksInBounds(Rectangle.of(0, 0, -1, 0))).to.throw();
    expect(() => chunks.listChunksInBounds(Rectangle.of(0, 0, 0, -1))).to.throw();

    expect(() => chunks.listChunksInBounds(
        Rectangle.of(0, 0, PhysicalConstants.WORLD_SIZE + 1, 1))).to.throw();
    expect(() => chunks.listChunksInBounds(
        Rectangle.of(0, 0, PhysicalConstants.WORLD_SIZE + 1, 0))).to.throw();
  });
});
