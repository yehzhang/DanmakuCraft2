import {SuperposedEntity} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

class SuperposedEntityRenderSystem implements ExistenceSystem<SuperposedEntity> {
  enter(entity: SuperposedEntity) {
    entity.acquireDisplay();
  }

  update(entity: SuperposedEntity) {
  }

  exit(entity: SuperposedEntity) {
    entity.releaseDisplay();
  }

  finish() {
  }
}

export default SuperposedEntityRenderSystem;
