import EntityFinder from './EntityFinder';
import PhysicalConstants from '../../PhysicalConstants';
import {toWorldCoordinate2d} from '../../law';
import Point from '../Point';
import IterablesIterator from '../iteration/IterablesIterator';
import {Region, StationaryEntity} from '../../entitySystem/alias';
import EntityFactory from '../../entitySystem/EntityFactory';

type EntityType = StationaryEntity;

/**
 * Implements {@link EntityFinder} with chunks.
 *
 * Note that only {@link StationaryEntity}s can be loaded, because this finder does not support
 * moving entities across containers. In this case, consider using {@link GlobalEntityFinder}.
 */
class ChunkEntityFinder<T extends EntityType> implements EntityFinder<T> {
  private chunkSize: number;
  private chunksCount: number;
  private chunks: Array<Array<Region<T>>>;

  /**
   * @param chunksCount Number of chunks in a certain dimension.
   * @param entityFactory Factory to create {@link Region}s.
   * @param entityLoaded
   * @param entityCrossedRegion
   */
  constructor(
      chunksCount: number,
      entityFactory: EntityFactory,
      readonly entityLoaded: Phaser.Signal<T>,
      readonly entityCrossedRegion: Phaser.Signal<T>) {
    this.chunksCount = Math.floor(chunksCount);
    this.chunkSize = PhysicalConstants.WORLD_SIZE / this.chunksCount;

    if (this.chunksCount <= 0) {
      throw new TypeError('Invalid chunks count');
    }

    this.chunks = this.createRegions(entityFactory);
  }

  private static validateRadius(radius: number) {
    if (!(radius >= 0 && radius * 2 <= PhysicalConstants.WORLD_SIZE)) {
      throw new TypeError(`Invalid radius: '${radius}'`);
    }
  }

  loadBatch(entities: Iterable<T>): void {
    for (let entity of entities) {
      this.load(entity);
    }
  }

  listAround(worldCoordinates: Point, radius: number) {
    ChunkEntityFinder.validateRadius(radius);

    if (radius === 0) {
      return [];
    }

    let bound = this.inflate(worldCoordinates, radius);
    return this.listChunksInBound(bound.left, bound.right, bound.top, bound.bottom);
  }

  load(entity: T): void {
    let coordinates = this.toChunkCoordinates(entity.coordinates);
    let chunk = this.getChunk(coordinates.x, coordinates.y);
    chunk.container.add(entity);

    this.entityLoaded.dispatch(entity);
  }

  isInSameContainer(worldCoordinates: Point, otherCoordinates: Point): boolean {
    return this.toChunkCoordinates(worldCoordinates)
        .equals(this.toChunkCoordinates(otherCoordinates));
  }

  [Symbol.iterator](): Iterator<Region<T>> {
    return IterablesIterator.of(this.chunks);
  }

  private createRegions(entityFactory: EntityFactory): Array<Array<Region<T>>> {
    let chunks = [];
    let coordinates = Point.origin();

    for (let y = 0; y < this.chunksCount; y++) {
      coordinates.y = y * this.chunkSize;
      let chunksRow = [];

      for (let x = 0; x < this.chunksCount; x++) {
        coordinates.x = x * this.chunkSize;
        chunksRow.push(entityFactory.createRegion<T>(coordinates));
      }

      chunks.push(chunksRow);
    }

    return chunks;
  }

  private listChunksInBound(
      left: number,
      right: number,
      top: number,
      bottom: number): Array<Region<T>> {
    let chunks: Array<Region<T>> = [];
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
      chunks: Array<Region<T>>): void {
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
  private toChunkCoordinates(coordinates: Point): Point {
    return toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE)
        .divide(this.chunkSize, this.chunkSize)
        .floor();
  }

  /**
   * If bounds are beyond the left or top of the world, they will be wrapped to the opposite ends.
   * All coordinates are guaranteed to be greater than or equal to 0.
   */
  private inflate(coordinates: Point, radius: number): Phaser.Rectangle {
    let topLeft = this.toChunkCoordinates(coordinates.clone().subtract(radius, radius));
    let bounds = new Phaser.Rectangle(topLeft.x, topLeft.y, 0, 0);

    let bottomRight = this.toChunkCoordinates(coordinates.clone().add(radius, radius));
    if (topLeft.x > bottomRight.x) {
      bottomRight.x += this.chunksCount;
    } else if (topLeft.x === bottomRight.x && !(radius * 2 < this.chunkSize)) {
      bottomRight.x += this.chunksCount - 1;  // world-wide bounds
    }
    if (topLeft.y > bottomRight.y) {
      bottomRight.y += this.chunksCount;
    } else if (topLeft.y === bottomRight.y && !(radius * 2 < this.chunkSize)) {
      bottomRight.y += this.chunksCount - 1;  // world-wide bounds
    }
    bounds.right = bottomRight.x;
    bounds.bottom = bottomRight.y;

    return bounds;
  }

  private getChunk(x: number, y: number) {
    return this.chunks[y][x];
  }
}

export default ChunkEntityFinder;
