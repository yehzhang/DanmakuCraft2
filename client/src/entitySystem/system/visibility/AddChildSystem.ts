import VisibilitySystem from './VisibilitySystem';
import {PIXI} from '../../../util/alias/phaser';
import Display from '../../component/Display';

class AddChildSystem implements VisibilitySystem<Display> {
  constructor(
      private container: PIXI.DisplayObjectContainer, private cacheAsBitmap: boolean = false) {
  }

  enter(entity: Display) {
    this.container.addChild(entity.display);
  }

  update(entity: Display) {
  }

  exit(entity: Display) {
    this.container.removeChild(entity.display);
  }

  finish() {
    if (this.container.cacheAsBitmap) {
      this.container.updateCache();
    } else if (this.cacheAsBitmap) {
      this.container.cacheAsBitmap = true;
    }
  }
}

export default AddChildSystem;
