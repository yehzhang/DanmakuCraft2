import {Entity, EntityManager, Region} from './entity';
import {PhysicalConstants} from '../Universe';

/**
 * Implements {@link EntityManager} with arrays of {@link Chunk}s.
 */
export class ChunkEntityManager<E extends Entity = Entity> implements EntityManager<E> {
  private chunkSize: number;
  private chunksCount: number;
  private chunks: Array<Array<Chunk<E>>>;

  /**
   * @param chunksCount Number of chunks in a certain dimension.
   */
  constructor(chunksCount: number) {
    // TODO support for updating render distance
    this.chunksCount = Math.floor(chunksCount);
    this.chunkSize = PhysicalConstants.WORLD_SIZE / this.chunksCount;

    if (this.chunksCount <= 0) {
      throw new Error('Invalid chunks count');
    }

    this.chunks = ChunkEntityManager.makeChunks(this.chunksCount, this.chunkSize);
  }

  private static makeChunks<E extends Entity>(
      chunksCount: number, chunkSize: number): Array<Array<Chunk<E>>> {
    let chunks = [];
    let coordinate = new Phaser.Point();

    for (let y = 0; y < chunksCount; y++) {
      coordinate.y = y * chunkSize;
      let chunksRow = [];

      for (let x = 0; x < chunksCount; x++) {
        coordinate.x = x * chunkSize;
        chunksRow.push(new Chunk<E>(coordinate));
      }

      chunks.push(chunksRow);
    }

    return chunks;
  }

  loadBatch(entities: E[]): void {
    for (let entity of entities) {
      this.load(entity);
    }
  }

  load(entity: E): void {
    let coordinate = this.toChunkCoordinate(entity.getCoordinate());
    let chunk = this.getChunk(coordinate.x, coordinate.y);
    chunk.addEntity(entity);
  }

  // TODO remove renderable chunks count
  leftOuterJoinAround(
      worldCoordinate: Phaser.Point,
      otherCoordinate: Phaser.Point,
      radius: number): Array<Chunk<E>> {
    ChunkEntityManager.validateRadius(radius);

    // Collect all chunks in either vertical or horizontal area.
    // Case 1.A:
    // V V H H
    // V V H H
    // V V H H
    // V V o o o o
    //     o o o o
    //     o o o o
    //     o o o o
    //
    // Case 1.B:
    // V V V V
    // V V V V
    // V V V V
    // V V V V
    //
    //           o o o o
    //           o o o o
    //           o o o o
    //           o o o o
    //
    // Case 2.A:
    // o o o o
    // o o o o
    // o o o o
    // o o o o V V
    //     H H V V
    //     H H V V
    //     H H V V
    //
    // Case 2.B:
    // o o o o
    // o o o o
    // o o o o
    // o o o o
    //
    //           V V V V
    //           V V V V
    //           V V V V
    //           V V V V
    //
    // Width and height of an square must not be shorter in both ends than those of another square,
    // which is guaranteed by both coordinates being inflated by the same radius.
    let chunks: Array<Chunk<E>> = [];

    let leftBound = this.inflate(worldCoordinate, radius);
    let rightBound = this.inflate(otherCoordinate, radius);
    if (leftBound.left !== rightBound.left || leftBound.right !== rightBound.right) {
      // Collect chunks in vertical area. (V)
      let left;
      let right;
      if (leftBound.left < rightBound.left) {
        // Case 1
        left = leftBound.left;
        right = Math.min(leftBound.right, rightBound.left - 1);
      } else {
        // Case 2
        left = Math.max(leftBound.left, rightBound.right + 1);
        right = leftBound.right;
      }

      let top = leftBound.top;
      let bottom = leftBound.bottom;
      this.pushChunksInBound(left, right, top, bottom, chunks);
    }

    if (leftBound.top !== rightBound.top || leftBound.bottom !== rightBound.bottom) {
      // Collect chunks in horizontal area. (H)
      let left;
      let right;
      if (leftBound.left < rightBound.left) {
        // Case 1
        left = rightBound.left;
        right = leftBound.right;
      } else {
        // Case 2
        left = leftBound.left;
        right = rightBound.right;
      }

      let top;
      let bottom;
      if (leftBound.top < rightBound.top) {
        // Case 1
        top = leftBound.top;
        bottom = Math.min(leftBound.bottom, rightBound.top - 1);
      } else {
        // Case 2
        top = Math.max(leftBound.top, rightBound.bottom + 1);
        bottom = leftBound.bottom;
      }

      this.pushChunksInBound(left, right, top, bottom, chunks);
    }

    return chunks;
  }

  forEach(f: (value: Chunk<E>, index: number) => void, thisArg?: any) {
    this.chunks.forEach((chunkRow, chunkRowIndex) => {
      chunkRow.forEach((chunk, chunkIndex) => {
        let index = chunkRowIndex * this.chunksCount + chunkIndex;
        f.call(thisArg, chunk, index);
      });
    });
  }

  listAround(worldCoordinate: Phaser.Point, radius: number) {
    ChunkEntityManager.validateRadius(radius);

    if (radius === 0) {
      return [];
    }

    let bound = this.inflate(worldCoordinate, radius);
    return this.listChunksInBound(bound.left, bound.right, bound.top, bound.bottom);
  }

  private static validateRadius(radius: number) {
    if (!(radius >= 0 && radius * 2 <= PhysicalConstants.WORLD_SIZE)) {
      throw new Error(`Invalid radius: '${radius}'`);
    }
  }

  isInSameRegion(worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): boolean {
    return this.toChunkCoordinate(worldCoordinate).equals(this.toChunkCoordinate(otherCoordinate));
  }

  private listChunksInBound(
      left: number,
      right: number,
      top: number,
      bottom: number): Array<Chunk<E>> {
    let chunks: Array<Chunk<E>> = [];
    this.pushChunksInBound(left, right, top, bottom, chunks);
    return chunks;
  }

  /**
   * Handles bounds that wrap around the world.
   * However, right and bottom must be greater than left and top, respectively.
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
  private inflate(worldCoordinate: Phaser.Point, radius: number): Phaser.Rectangle {
    let topLeft = this.toChunkCoordinate(worldCoordinate.clone().subtract(radius, radius));
    let bound = new Phaser.Rectangle(topLeft.x, topLeft.y, 0, 0);

    let bottomRight = this.toChunkCoordinate(worldCoordinate.clone().add(radius, radius));
    if (topLeft.x > bottomRight.x) {
      bottomRight.x += this.chunksCount;
    }
    if (topLeft.y > bottomRight.y) {
      bottomRight.y += this.chunksCount;
    }
    bound.right = bottomRight.x;
    bound.bottom = bottomRight.y;

    return bound;
  }

  private getChunk(x: number, y: number) {
    return this.chunks[y][x];
  }
}

/**
 * Implements {@link Region} with an array.
 */
export class Chunk<E extends Entity> extends Region<E> {
  private entities: E[];

  constructor(coordinate: Phaser.Point) {
    super(coordinate);
    this.entities = [];
  }

  addEntity(entity: E) {
    // TODO test entity is not double added
    // TODO test entity.coordinate >= 0
    this.entities.push(entity);
  }

  countEntities() {
    return this.entities.length;
  }

  forEach(f: (value: E, index: number) => void, thisArg?: any) {
    return this.entities.forEach(f, thisArg);
  }
}
