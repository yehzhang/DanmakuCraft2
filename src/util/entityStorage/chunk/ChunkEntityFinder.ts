import EntityFinder, {EntityMovedEvent} from '../EntityFinder';
import Point from '../../Point';
import {Region, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import {validateRadius} from '../../../law';
import {Phaser} from '../../../../types/phaser';

/**
 * Implements {@link EntityFinder} with chunks.
 *
 * Note that only {@link StationaryEntity}s can be loaded, because this finder does not support
 * moving entities across containers. In this case, consider using {@link GlobalEntityFinder}.
 */
class ChunkEntityFinder<T> implements EntityFinder<Region<T>> {
  constructor(
      private chunks: Chunks<T>,
      readonly entityRegistered: Phaser.Signal<Region<T>>,
      readonly entityMoved: Phaser.Signal<EntityMovedEvent<Region<T>>>) {
  }

  private static inflate(coordinates: Point, radius: number): Phaser.Rectangle {
    return new Phaser.Rectangle(
        coordinates.x - radius,
        coordinates.y - radius,
        radius * 2,
        radius * 2);
  }

  listAround(coordinates: Point, radius: number) {
    validateRadius(radius);

    let bounds = ChunkEntityFinder.inflate(coordinates, radius);
    return this.chunks.listChunksInBounds(bounds);
  }

  findClosetEntityTo(coordinates: Point) {
    return this.chunks.getChunkByCoordinates(coordinates);
  }

  [Symbol.iterator]() {
    return this.chunks[Symbol.iterator]();
  }
}

export default ChunkEntityFinder;
