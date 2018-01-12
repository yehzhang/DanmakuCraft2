import ExistenceSystem from './ExistenceSystem';
import {Renderable} from '../../alias';

class CacheAsBitmapSystem implements ExistenceSystem<Renderable> {
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
