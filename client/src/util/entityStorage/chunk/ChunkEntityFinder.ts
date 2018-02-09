import EntityFinder, {StateChanged} from '../EntityFinder';
import Point from '../../syntax/Point';
import {DisplayableRegion, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import {validateRadius} from '../../../law/space';
import Iterator from '../../syntax/Iterator';
import {Phaser} from '../../alias/phaser';
import Rectangle from '../../syntax/Rectangle';

/**
 * Implements {@link EntityFinder} with chunks.
 *
 * Note that only {@link StationaryEntity}s can be loaded, because this finder does not support
 * moving entities across containers. In this case, consider using {@link GlobalEntityFinder}.
 */
class ChunkEntityFinder<T> implements EntityFinder<DisplayableRegion<T>> {
  constructor(
      private chunks: Chunks<DisplayableRegion<T>>,
      readonly onStateChanged: Phaser.Signal<StateChanged<DisplayableRegion<T>>>) {
  }

  listAround(coordinates: Point, radius: number) {
    validateRadius(radius);

    const bounds = Rectangle.inflateFrom(coordinates, radius);
    return this.chunks.listChunksInBounds(bounds);
  }

  [Symbol.iterator]() {
    return Iterator.of(this.chunks);
  }
}

export default ChunkEntityFinder;
