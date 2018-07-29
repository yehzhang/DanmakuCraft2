import {PIXI} from '../../../util/alias/phaser';
import Chunks from '../../../util/dataStructures/Chunks';
import Point from '../../../util/syntax/Point';
import {StationaryEntity} from '../../alias';
import CountEntities from '../../component/CountEntities';
import Display from '../../component/Display';
import ImmutableCoordinates from '../../component/ImmutableCoordinates';
import Entity from '../../Entity';
import UnmovableDisplayPositioningSystem from './UnmovableDisplayPositioningSystem';
import VisibilitySystem from './VisibilitySystem';

type CachedChunk = StationaryEntity & Display & CountEntities;

/**
 * Renders and caches entities in chunks. Caching is permanent throughout the instance of game.
 */
class CachedChunksRenderSystem implements VisibilitySystem<CachedChunk> {
  constructor(
      private layer: PIXI.DisplayObjectContainer,
      private positioningSystem: UnmovableDisplayPositioningSystem,
      private chunks = Chunks.create(createCachedChunk),
      private chunksToUpdateCache: CachedChunk[] = []) {
    for (const chunk of chunks) {
      chunk.display.visible = false;
      layer.addChild(chunk.display);
    }
  }

  enter(entity: StationaryEntity & Display) {
    const chunk = this.chunks.getChunkByCoordinates(entity.coordinates);

    if (!chunk.countEntities) {
      chunk.display.visible = true;
      this.positioningSystem.enter(chunk);
    }

    chunk.countEntities++;

    if (chunk.display.children.includes(entity.display)) {
      return;
    }
    chunk.display.addChild(entity.display);
    entity.display.position = Point.subtract(entity.coordinates, chunk.coordinates);

    this.chunksToUpdateCache.push(chunk);
  }

  update(entity: StationaryEntity & Display) {
  }

  exit(entity: StationaryEntity & Display) {
    const chunk = this.chunks.getChunkByCoordinates(entity.coordinates);
    chunk.countEntities--;

    if (chunk.countEntities) {
      return;
    }
    chunk.display.visible = false;
  }

  finish() {
    for (const chunk of this.chunksToUpdateCache) {
      chunk.display.updateCache();
    }
    this.chunksToUpdateCache.length = 0;
  }
}

function createCachedChunk(point: Point): CachedChunk {
  return Entity.newBuilder()
      .mix(new ImmutableCoordinates(point))
      .mix(new Display(new PIXI.DisplayObjectContainer()))
      .mix(new CountEntities())
      .build();
}

export default CachedChunksRenderSystem;
