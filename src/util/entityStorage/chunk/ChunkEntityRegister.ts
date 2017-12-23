import {Region, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import EntityFactory from '../../../entitySystem/EntityFactory';
import BaseEntityRegister from '../BaseEntityRegister';
import {EntityExistenceUpdatedEvent} from '../EntityFinder';

class ChunkEntityRegister<T extends StationaryEntity> extends BaseEntityRegister<T> {
  constructor(
      private chunks: Chunks<Region<T>>,
      private entityRegistered: Phaser.Signal<EntityExistenceUpdatedEvent<Region<T>>>,
      private entityFactory: EntityFactory) {
    super();
  }

  register(entity: T, dispatchEvent = true) {
    let chunk = this.chunks.getChunkByCoordinates(entity.coordinates);

    if (dispatchEvent) {
      let newChunk = this.entityFactory.cloneRegion(chunk);
      newChunk.container.add(entity);

      this.chunks.replaceChunkByCoordinates(entity.coordinates, newChunk);

      this.entityRegistered.dispatch(new EntityExistenceUpdatedEvent(newChunk, chunk));
    } else {
      chunk.container.add(entity);
    }
  }
}

export default ChunkEntityRegister;
