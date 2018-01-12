import {Renderable} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

class CacheAsBitmapSystem implements ExistenceSystem<Renderable> {
  adopt(entity: Renderable) {
    entity.display.cacheAsBitmap = true;
  }

  abandon(entity: Renderable) {
  }
}

export default CacheAsBitmapSystem;
