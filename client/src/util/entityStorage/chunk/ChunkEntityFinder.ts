import {DisplayableRegion, StationaryEntity} from '../../../entitySystem/alias';
import {validateRadius} from '../../../law/space';
import {Phaser} from '../../alias/phaser';
import Iterator from '../../syntax/Iterator';
import Point from '../../syntax/Point';
import Rectangle from '../../syntax/Rectangle';
import EntityFinder, {StateChanged} from '../EntityFinder';
import Chunks from './Chunks';

/**
 * Implements {@link EntityFinder} with chunks.
 *
 * Note that only {@link StationaryEntity}s can be loaded, because this finder does not support
 * moving entities across containers. In this case, consider using {@link GlobalEntityFinder}.
 */
class ChunkEntityFinder<T> implements EntityFinder<DisplayableRegion<T>> {
  constructor(
      private readonly chunks: Chunks<DisplayableRegion<T>>,
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
