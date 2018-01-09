import {Region, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import EntityFactory from '../../../entitySystem/EntityFactory';
import BaseEntityRegister from '../BaseEntityRegister';
import {EntityExistenceUpdatedEvent} from '../EntityFinder';
import {Phaser} from '../../alias/phaser';

class ChunkEntityRegister<T extends StationaryEntity> extends BaseEntityRegister<T> {
  constructor(
      private chunks: Chunks<Region<T>>,
      private entityRegistered: Phaser.Signal<EntityExistenceUpdatedEvent<Region<T>>>,
      private entityFactory: EntityFactory) {
    super();
  }

  register(entity: T, silent?: boolean) {
    let chunk = this.chunks.getChunkByCoordinates(entity.coordinates);

    if (silent) {
      chunk.container.add(entity);
    } else {
      let newChunk = this.entityFactory.cloneRegion(chunk);
      newChunk.container.add(entity);

      this.chunks.replaceChunkByCoordinates(entity.coordinates, newChunk);

      this.entityRegistered.dispatch(new EntityExistenceUpdatedEvent(newChunk, chunk));
    }
  }

  deregister(entity: T, silent?: boolean) {
    // TODO
    throw new Error('Not implemented');
  }

  count(): number {
    // TODO
    throw new Error('Not implemented');
  }

  [Symbol.iterator](): Iterator<T> {
    // TODO
    throw new Error('Not implemented');
  }
}

export default ChunkEntityRegister;
