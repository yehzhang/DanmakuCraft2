import {Region, StationaryEntity} from '../../../entitySystem/alias';
import Chunks from './Chunks';
import EntityFactory from '../../../entitySystem/EntityFactory';
import BaseEntityRegister from '../BaseEntityRegister';

class ChunkEntityRegister<T extends StationaryEntity> extends BaseEntityRegister<T> {
  constructor(
      private chunks: Chunks<Region<T>>,
      private entityRegistered: Phaser.Signal<Region<T>>,
      private entityFactory: EntityFactory) {
    super();
  }

  register(entity: T, dispatchEvent = true) {
    let chunk = this.addEntityToChunk(entity);
    if (dispatchEvent) {
      this.dispatchEntityRegistered(entity, chunk);
    }
  }

  private addEntityToChunk(entity: T): Region<T> {
    let chunk = this.chunks.getChunkByCoordinates(entity.coordinates);
    chunk.container.add(entity);

    return chunk;
  }

  private dispatchEntityRegistered(entity: T, chunk: Region<T>) {
    let enteringChunk = this.entityFactory.cloneRegionVisually(chunk);
    enteringChunk.container.add(entity);

    this.entityRegistered.dispatch(enteringChunk);
  }
}

export default ChunkEntityRegister;
