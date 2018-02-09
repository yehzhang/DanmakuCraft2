import {DisplayableRegion, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import EntityFactory from '../../../entitySystem/EntityFactory';
import {StateChanged} from '../EntityFinder';
import {Phaser} from '../../alias/phaser';
import {asSequence} from 'sequency';
import Iterator from '../../syntax/Iterator';
import EntityRegister from '../EntityRegister';
import ImmutableContainer from '../ImmutableContainer';

// TODO ChunkEntityRegister cannot handle comments protruding from a chunk
// Can add an entity to multiple regions, but cannot add a display to multiple parents.
class ChunkEntityRegister<T extends StationaryEntity> implements EntityRegister<T> {
  constructor(
      private chunks: Chunks<DisplayableRegion<T>>,
      private onStateChanged: Phaser.Signal<StateChanged<DisplayableRegion<T>>>,
      private entityFactory: EntityFactory) {
  }

  register(entity: T) {
    const chunk = this.chunks.getChunkByCoordinates(entity.coordinates);
    const newChunk = this.entityFactory.createRegion(chunk.coordinates, chunk.add(entity));

    this.chunks.replaceChunkByCoordinates(chunk.coordinates, newChunk);

    this.onStateChanged.dispatch(new StateChanged([newChunk], [chunk]));
  }

  registerBatch(entities: Iterable<T>) {
    const entitiesArray = Array.from(entities);

    if (entitiesArray.length === 0) {
      return;
    }

    const chunksToReplace = new Map<DisplayableRegion<T>, T[]>();
    for (const entity of entitiesArray) {
      const chunkToReplace = this.chunks.getChunkByCoordinates(entity.coordinates);

      let entitiesToAdd = chunksToReplace.get(chunkToReplace);
      if (entitiesToAdd == null) {
        entitiesToAdd = [];
        chunksToReplace.set(chunkToReplace, entitiesToAdd);
      }

      entitiesToAdd.push(entity);
    }

    const newChunks: Array<DisplayableRegion<T>> = [];
    const oldChunks: Array<DisplayableRegion<T>> = [];
    for (const [chunk, entitiesToAdd] of chunksToReplace) {
      const entitiesContainer = entitiesToAdd.reduce<ImmutableContainer<T>>(
          (container, entity) => container.add(entity), chunk);
      const newChunk = this.entityFactory.createRegion(chunk.coordinates, entitiesContainer);
      this.chunks.replaceChunkByCoordinates(newChunk.coordinates, newChunk);

      newChunks.push(newChunk);
      oldChunks.push(chunk);
    }

    this.onStateChanged.dispatch(new StateChanged(newChunks, oldChunks));
  }

  deregister(entity: T) {
    // TODO
    throw new Error('Not implemented');
  }

  [Symbol.iterator]() {
    const entities = asSequence(this.chunks).flatMap(chunk => asSequence(chunk)).asIterable();
    return Iterator.of(entities);
  }
}

export default ChunkEntityRegister;
