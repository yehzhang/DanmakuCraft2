import VisibilitySystem from './VisibilitySystem';
import {Renderable, RenderableEntity} from '../../alias';
import {PIXI} from '../../../util/alias/phaser';

class AddChildSystem implements VisibilitySystem<RenderableEntity> {
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

export default AddChildSystem;
