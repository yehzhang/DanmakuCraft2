import {Entity} from './entity';
import {PhysicalConstants} from '../Universe';
import {toWorldCoordinate2d} from '../law';
import {EntityManager, Region} from './EntityManager';

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
    // Maximum radius is WORLD_SIZE / 4 for the optimization in left outer join.
    if (!(radius >= 0 && radius * 2 <= PhysicalConstants.WORLD_SIZE / 2)) {
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
   * Right and bottom must be greater than left and top, respectively.
   */
  private pushChunksInBound(
      left: number,
      right: number,
      top: number,
      bottom: number,
      chunks: Array<Chunk<E>>): void {
    for (let indexY = top; indexY <= bottom; indexY++) {
      let y = (indexY + this.chunksCount) % this.chunksCount;
      let chunkRow = this.chunks[y];
      for (let indexX = left; indexX <= right; indexX++) {
        let x = (indexX + this.chunksCount) % this.chunksCount;
        chunks.push(chunkRow[x]);
      }
    }
  }

  /**
   * Also, wraps coordinates that are out of one side of the world to the other side.
   */
  private toChunkCoordinate(coordinate: Phaser.Point): Phaser.Point {
    return toWorldCoordinate2d(coordinate, PhysicalConstants.WORLD_SIZE)
        .divide(this.chunkSize, this.chunkSize)
        .floor();
  }

  /**
   * If bounds are beyond the left or top of the world, they will be wrapped to the opposite ends.
   * All coordinates are guaranteed to be greater than or equal to 0.
   */
  private inflate(coordinate: Phaser.Point, radius: number): Phaser.Rectangle {
    let topLeft = this.toChunkCoordinate(coordinate.clone().subtract(radius, radius));
    let bound = new Phaser.Rectangle(topLeft.x, topLeft.y, 0, 0);

    let bottomRight = this.toChunkCoordinate(coordinate.clone().add(radius, radius));
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
