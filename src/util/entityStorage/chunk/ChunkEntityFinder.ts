import EntityFinder, {EntityExistenceUpdatedEvent} from '../EntityFinder';
import Point from '../../syntax/Point';
import {Region, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import {validateRadius} from '../../../law/space';
import Iterator from '../../syntax/Iterator';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

/**
 * Implements {@link EntityFinder} with chunks.
 *
 * Note that only {@link StationaryEntity}s can be loaded, because this finder does not support
 * moving entities across containers. In this case, consider using {@link GlobalEntityFinder}.
 */
class ChunkEntityFinder<T> implements EntityFinder<Region<T>> {
  constructor(
      private chunks: Chunks<Region<T>>,
      readonly entityExistenceUpdated: Phaser.Signal<EntityExistenceUpdatedEvent<Region<T>>>) {
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

  [Symbol.iterator]() {
    return Iterator.of(this.chunks);
  }
}

export default ChunkEntityFinder;
