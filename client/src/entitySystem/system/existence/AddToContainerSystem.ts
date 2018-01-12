import ExistenceSystem from './ExistenceSystem';
import {Renderable, RenderableEntity} from '../../alias';
import {PIXI} from '../../../util/alias/phaser';

class AddToContainerSystem implements ExistenceSystem<RenderableEntity> {
  constructor(private container: PIXI.DisplayObjectContainer) {
  }

  enter(entity: RenderableEntity) {
    this.container.addChild(entity.display);
  }

  update(entity: RenderableEntity) {
  }

  exit(entity: Renderable) {
    this.container.removeChild(entity.display);
  }

  finish() {
    if (this.container.cacheAsBitmap) {
      this.container.updateCache();
    }
  }
}

export default AddToContainerSystem;
