import Display from '../../component/Display';
import RenderSystem from './RenderSystem';


class CachedRenderSystem extends RenderSystem {
  enter(entity: Display) {
    entity.display.cacheAsBitmap = true;
    super.enter(entity);
  }

  // If a display is cached it should never be updated.
  // Uncomment this method to update cached display anyway.
  // finish() {
  //   if (this.container.cacheAsBitmap) {
  //     this.container.updateCache();
  //   }
  // }
}

export default CachedRenderSystem;
