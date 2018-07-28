import {asSequence} from 'sequency';
import {toWorldCoordinate, toWorldCoordinate2d, validateRadius} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';
import {Phaser} from '../../alias/phaser';
import Iterator from '../../syntax/Iterator';
import Point from '../../syntax/Point';

class Chunks<T> implements Iterable<T> {
  constructor(private readonly chunks: T[][], readonly chunkSize: number) {
    if (chunkSize <= 0) {
      throw new TypeError('Invalid chunk size');
    }

    const chunksWidths = new Set(chunks.map(chunksRow => chunksRow.length));
    if (chunksWidths.size !== 1) {
      throw new TypeError('Invalid chunks dimension');
    }

    if (chunks[0].length !== chunks.length) {
      throw new TypeError('Chunks are not square-shaped');
    }
  }

  static create<T>(
      createChunk: (point: Point) => T,
      chunksCount: number = PhysicalConstants.COMMENT_CHUNKS_COUNT): Chunks<T> {
    const chunkSize = PhysicalConstants.WORLD_SIZE / chunksCount;

    const chunks = [];
    const coordinates = Point.origin();
    for (let y = 0; y < chunksCount; y++) {
      coordinates.y = y * chunkSize;
      const chunksRow = [];

      for (let x = 0; x < chunksCount; x++) {
        coordinates.x = x * chunkSize;
        chunksRow.push(createChunk(coordinates));
      }

      chunks.push(chunksRow);
    }

    return new Chunks(chunks, chunkSize);
  }

  private get chunksSide() {
    return this.chunks.length;
  }

  getChunkByCoordinates(coordinates: Point) {
    const chunkCoordinates = this.toInteriorChunkCoordinates(coordinates);
    return this.getChunkByInteriorChunkCoordinates(chunkCoordinates.x, chunkCoordinates.y);
  }

  replaceChunkByCoordinates(coordinates: Point, chunk: T) {
    const chunkCoordinates = this.toInteriorChunkCoordinates(coordinates);
    this.setChunkByInteriorChunkCoordinates(chunkCoordinates.x, chunkCoordinates.y, chunk);
  }

  [Symbol.iterator](): Iterator<T> {
    return Iterator.of(asSequence(this.chunks).flatten().asIterable());
  }

  listChunksInBounds(bounds: Phaser.Rectangle): T[] {
    validateRadius(bounds.width / 2);
    validateRadius(bounds.height / 2);

    if (bounds.width === 0 || bounds.height === 0) {
      return [];
    }

    const topLeft = this.toInteriorChunkCoordinates(bounds.topLeft);

    const bottomRight = this.toInteriorChunkCoordinates(bounds.bottomRight);
    if (topLeft.y > bottomRight.y) {
      bottomRight.y += this.chunksSide;
    } else if (topLeft.y === bottomRight.y && !(bounds.height < this.chunkSize)) {
      bottomRight.y += this.chunksSide - 1;  // world-wide bounds
    }
    if (topLeft.x > bottomRight.x) {
      bottomRight.x += this.chunksSide;
    } else if (topLeft.x === bottomRight.x && !(bounds.width < this.chunkSize)) {
      bottomRight.x += this.chunksSide - 1;  // world-wide bounds
    }

    const chunks = [];
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        chunks.push(this.getChunkByChunkCoordinates(x, y));
      }
    }

    return chunks;
  }

  private getChunkByChunkCoordinates(chunkCoordinateX: number, chunkCoordinateY: number) {
    chunkCoordinateX = toWorldCoordinate(chunkCoordinateX, this.chunksSide);
    chunkCoordinateY = toWorldCoordinate(chunkCoordinateY, this.chunksSide);
    return this.getChunkByInteriorChunkCoordinates(chunkCoordinateX, chunkCoordinateY);
  }

  private getChunkByInteriorChunkCoordinates(chunkCoordinateX: number, chunkCoordinateY: number) {
    return this.chunks[chunkCoordinateY][chunkCoordinateX];
  }

  private setChunkByInteriorChunkCoordinates(
      chunkCoordinateX: number,
      chunkCoordinateY: number,
      chunk: T) {
    this.chunks[chunkCoordinateY][chunkCoordinateX] = chunk;
  }

  /**
   * Also, wraps coordinates that are out of one side of the world to the other side.
   */
  private toInteriorChunkCoordinates(coordinates: Point): Point {
    return toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE)
        .divide(this.chunkSize, this.chunkSize)
        .floor();
  }
}

export default Chunks;
