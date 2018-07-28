import {PIXI} from '../../../util/alias/phaser';
import {StationaryEntity} from '../../alias';
import Blink from '../../component/Blink';
import Display from '../../component/Display';
import CachedChunksRenderSystem from './CachedChunksRenderSystem';
import RenderSystem from './RenderSystem';
import UnmovableDisplayPositioningSystem from './UnmovableDisplayPositioningSystem';
import VisibilitySystem from './VisibilitySystem';

type EntityType = StationaryEntity & Display & Blink;

class BlinkSupportedRenderSystem implements VisibilitySystem<EntityType> {
  constructor(
      container: PIXI.DisplayObjectContainer,
      private plainEntityRenderSystem: CachedChunksRenderSystem,
      private blinkEntityRenderSystem: RenderSystem,
      private blinkEntityPositioningSystem: UnmovableDisplayPositioningSystem) {
  }

  enter(entity: EntityType) {
    if (entity.hasBlink()) {
      if (entity.isBlinking()) {
        this.blinkEntityRenderSystem.enter(entity);
        this.blinkEntityPositioningSystem.enter(entity);

        return;
      }
      entity.releaseBlink();
    }
    this.plainEntityRenderSystem.enter(entity);
  }

  update() {
  }

  exit(entity: EntityType) {
    if (entity.hasBlink()) {
      this.blinkEntityRenderSystem.exit(entity);

      entity.releaseBlink();

      return;
    }
    this.plainEntityRenderSystem.exit(entity);
  }

  finish() {
  }
}

export default BlinkSupportedRenderSystem;
