import {SuperposedEntity} from '../../alias';
import BaseExistenceSystem from './BaseExistenceSystem';

class SuperposedEntityRenderSystem extends BaseExistenceSystem<SuperposedEntity> {
  enter(entity: SuperposedEntity) {
    entity.acquireDisplay();
  }

  exit(entity: SuperposedEntity) {
    entity.releaseDisplay();
  }

  finish() {
  }
}

export default SuperposedEntityRenderSystem;
