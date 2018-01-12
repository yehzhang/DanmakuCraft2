import VisibilitySystem from './VisibilitySystem';
import {Renderable} from '../../alias';

class CacheAsBitmapSystem implements VisibilitySystem<Renderable> {
  enter(entity: Renderable) {
    entity.display.cacheAsBitmap = true;
  }

  update(entity: Renderable) {
  }

  exit(entity: Renderable) {
  }

  finish() {
  }
}

export default CacheAsBitmapSystem;
