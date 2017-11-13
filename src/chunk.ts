import {Entity, EntityManager, Region} from './entity';

/**
 * Implements {@link EntityManager} with arrays of {@link Chunk}s.
 */
export class ChunkEntityManager<E extends Entity = Entity> implements EntityManager<E> {
  private renderChunksCount: number;
  private chunkSize: number;
  private chunksCount: number;
  private chunks: Array<Array<Chunk<E>>>;

  /**
   * @param worldSize Size of the world.
   * @param chunksCount Number of chunks in a certain dimension.
   * @param renderDistance Minimum distance in world coordinate to render around a point.
   */
  constructor(worldSize: number, chunksCount: number, renderDistance: number) {
    this.chunksCount = Math.floor(chunksCount);
    this.chunkSize = worldSize / this.chunksCount;
    this.renderChunksCount = Math.ceil(renderDistance / this.chunkSize);
    this.chunks = ChunkEntityManager.makeChunks(this.chunksCount);

    if (worldSize <= 0) {
      throw new Error('Invalid world size');
    }

    if (this.chunksCount <= 0) {
      throw new Error('Invalid chunks count');
    }

    if (this.renderChunksCount <= 0) {
      throw new Error('Invalid render distance');
    }
    if ((this.renderChunksCount * 2 + 1) * this.chunkSize > worldSize) {
      throw new Error('Render distance too large');
    }
  }

  private static makeChunks<E extends Entity>(chunksCount: number): Array<Array<Chunk<E>>> {
    let chunks = [];

    for (let y = 0; y < chunksCount; y++) {
      let chunksRow = [];

      for (let x = 0; x < chunksCount; x++) {
        let id = y * chunksCount + x;
        chunksRow.push(new Chunk<E>(id));
      }

      chunks.push(chunksRow);
    }

    return chunks;
  }

  loadBatch(entities: E[]): void {
    entities.forEach(this.load.bind(this));
  }

  load(entity: E): void {
    let coordinate = this.toChunkCoordinate(entity.getCoordinate());
    let chunk = this.getChunk(coordinate);
    chunk.addEntity(entity);
  }

  listRenderableRegions(worldCoordinate: Phaser.Point): Array<Chunk<E>> {
    let chunks: Array<Chunk<E>> = [];

    let coordinate = this.toChunkCoordinate(worldCoordinate);
    let bound = this.inflate(coordinate, this.renderChunksCount);
    this.pushChunksInBound(bound.left, bound.right, bound.top, bound.bottom, chunks);

    return chunks;
  }

  leftOuterJoinRenderableRegions(
      worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): Array<Chunk<E>> {
    let leftCoordinate = this.toChunkCoordinate(worldCoordinate);
    let rightCoordinate = this.toChunkCoordinate(otherCoordinate);
    if (leftCoordinate.equals(rightCoordinate)) {
      return [];
    }

    // Collect all chunks in either vertical or horizontal area.
    // Case 1:
    // V V H H
    // V V H H
    // V V H H
    // V V o o o o
    //     o o o o
    //     o o o o
    //     o o o o
    //
    // Case 2:
    // o o o o
    // o o o o
    // o o o o
    // o o o o V V
    //     H H V V
    //     H H V V
    //     H H V V
    let chunks: Array<Chunk<E>> = [];

    // Collect chunks in vertical area.
    let leftBound = this.inflate(leftCoordinate, this.renderChunksCount);
    let rightBound = this.inflate(rightCoordinate, this.renderChunksCount);
    if (leftCoordinate.x !== rightCoordinate.x) {
      let left;
      let right;
      if (leftCoordinate.x < rightCoordinate.x) {
        left = leftBound.left;
        right = rightBound.left - 1;
      } else {
        left = rightBound.right + 1;
        right = leftBound.right;
      }

      let top = leftBound.top;
      let bottom = leftBound.bottom;
      this.pushChunksInBound(left, right, top, bottom, chunks);
    }

    // Collect chunks in horizontal area.
    if (leftCoordinate.y !== rightCoordinate.y) {
      let left;
      let right;
      if (leftCoordinate.x < rightCoordinate.x) {
        left = rightBound.left;
        right = leftBound.right;
      } else {
        left = leftBound.left;
        right = rightBound.right;
      }

      let top;
      let bottom;
      if (leftCoordinate.y < rightCoordinate.y) {
        top = leftBound.top;
        bottom = rightBound.top - 1;
      } else {
        top = rightBound.bottom + 1;
        bottom = leftBound.bottom;
      }

      this.pushChunksInBound(left, right, top, bottom, chunks);
    }

    return chunks;
  }

  /**
   * Handles bounds that wrap around the world.
   */
  private pushChunksInBound(
      left: number,
      right: number,
      top: number,
      bottom: number,
      chunks: Array<Chunk<E>>): void {
    for (let indexY = top; indexY <= bottom; indexY++) {
      let y = (indexY + this.chunksCount) % this.chunksCount;
      for (let indexX = left; indexX <= right; indexX++) {
        let x = (indexX + this.chunksCount) % this.chunksCount;
        chunks.push(this.chunks[y][x]);
      }
    }
  }

  /**
   * Wraps coordinates that are out of one side of the world to the other side.
   */
  private toChunkCoordinate(worldCoordinate: Phaser.Point): Phaser.Point {
    let coordinate = worldCoordinate.clone().divide(this.chunkSize, this.chunkSize).floor();
    coordinate.x = (coordinate.x % this.chunksCount + this.chunksCount) % this.chunksCount;
    coordinate.y = (coordinate.y % this.chunksCount + this.chunksCount) % this.chunksCount;

    if (isNaN(coordinate.x)
        || !isFinite(coordinate.x)
        || isNaN(coordinate.y)
        || !isFinite(coordinate.y)) {
      throw new Error('Invalid world coordinate');
    }

    return coordinate;
  }

  /**
   * If bounds are beyond the left or top of the world, they will be wrapped to the opposite ends.
   * All coordinates are guaranteed to be greater than or equal to 0.
   */
  private inflate(coordinate: Phaser.Point, n: number): Phaser.Rectangle {
    let bound = new Phaser.Rectangle(coordinate.x, coordinate.y, 0, 0)
        .inflate(n, n)
        .offset(this.chunksCount, this.chunksCount);
    bound.x %= this.chunksCount;
    bound.y %= this.chunksCount;
    return bound;
  }

  private getChunk(coordinate: Phaser.Point) {
    return this.chunks[coordinate.y][coordinate.x];
  }
}

/**
 * Implements {@link Region} with an array.
 */
export class Chunk<E extends Entity> implements Region<E> {
  private entities: E[];

  constructor(public readonly uniqueId: number) {
    this.entities = [];
  }

  addEntity(entity: E) {
    this.entities.push(entity);
  }

  countEntities() {
    return this.entities.length;
  }

  forEach(f: (entity: E) => void) {
    this.entities.forEach(f);
  }
}
