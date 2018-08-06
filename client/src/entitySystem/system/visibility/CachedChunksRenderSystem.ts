import {PIXI} from '../../../util/alias/phaser';
import RenderThrottler from '../../../util/async/RenderThrottler';
import Chunks from '../../../util/dataStructures/Chunks';
import Point from '../../../util/syntax/Point';
import {StationaryEntity} from '../../alias';
import CountEntities from '../../component/CountEntities';
import Display from '../../component/Display';
import ImmutableCoordinates from '../../component/ImmutableCoordinates';
import Entity from '../../Entity';
import TickSystem from '../tick/TickSystem';
import UnmovableDisplayRelativePositioningSystem from './UnmovableDisplayRelativePositioningSystem';
import VisibilitySystem from './VisibilitySystem';

type CachedChunk = StationaryEntity & Display & CountEntities;

/**
 * Renders and caches entities in chunks.
 */
class CachedChunksRenderSystem implements VisibilitySystem<StationaryEntity & Display>, TickSystem {
  constructor(
      private readonly layer: PIXI.DisplayObjectContainer,
      private readonly positioningSystem: UnmovableDisplayRelativePositioningSystem,
      private readonly chunks = Chunks.create(createCachedChunk),
      private readonly chunksToUpdateCache = new Set<CachedChunk>(),
      private readonly throttler = new RenderThrottler()) {
  }

  enter(entity: StationaryEntity & Display) {
    const chunk = this.chunks.getChunkByCoordinates(entity.coordinates);

    if (!chunk.countEntities) {
      this.positioningSystem.enter(chunk);
      this.layer.addChild(chunk.display);
    }

    chunk.countEntities++;

    if (chunk.display.children.includes(entity.display)) {
      return;
    }
    if (chunk.display.children.length >= 19) {  // 19 is empirically optimal
      this.chunksToUpdateCache.add(chunk);
    }

    chunk.display.addChild(entity.display);
    entity.display.position = Point.subtract(entity.coordinates, chunk.coordinates).floor();
  }

  update(entity: StationaryEntity & Display) {
  }

  exit(entity: StationaryEntity & Display) {
    const chunk = this.chunks.getChunkByCoordinates(entity.coordinates);

    chunk.countEntities--;

    if (chunk.countEntities) {
      return;
    }
    this.layer.removeChild(chunk.display);

    // // Clear cache to release memory?
    // if (chunk.display.children.length >= 19) {  // 19 is empirically optimal
    //   return;
    // }
    // chunk.display.removeChildren();
    // chunk.display.cacheAsBitmap = false;
    // chunk.display.cacheAsBitmap = true;
  }

  finish() {
  }

  tick(time: Phaser.Time) {
    this.updateCache(time);
  }

  getUpdateQueueSize(): number {
    return this.chunksToUpdateCache.size;
  }

  private updateCache(time: Phaser.Time) {
    for (const chunk of this.chunksToUpdateCache) {
      if (!this.throttler.run(() => {
        chunk.display.updateCache();
      }, time)) {
        return;
      }
      this.chunksToUpdateCache.delete(chunk);
    }
  }
}

function createCachedChunk(point: Point): CachedChunk {
  const display = new PIXI.DisplayObjectContainer();
  // display.cacheAsBitmap = true;

  return Entity.newBuilder()
      .mix(new ImmutableCoordinates(point))
      .mix(new Display(display))
      .mix(new CountEntities())
      .build();
}

export default CachedChunksRenderSystem;
