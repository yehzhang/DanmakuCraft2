import VisibilitySystem from './VisibilitySystem';
import {PIXI} from '../../../util/alias/phaser';
import Display from '../../component/Display';

class AddChildSystem implements VisibilitySystem<Display> {
  constructor(
      private container: PIXI.DisplayObjectContainer, private cacheAsBitmap: boolean = false) {
  }

  enter(entity: Display) {
    entity.display.cacheAsBitmap = this.cacheAsBitmap;
    this.container.addChild(entity.display);

    if (__DEV__) {
      (window as any).db.showBoundsOf(entity);
    }
  }

  update(entity: Display) {
  }

  exit(entity: Display) {
    this.container.removeChild(entity.display);
    if (__DEV__) {
      (window as any).db.hideBoundsOf(entity);
    }
  }

  finish() {
    // If a display is cached it should never be updated.
    // Uncomment this statement to update cached display anyway.
    // if (this.container.cacheAsBitmap) {
    //   this.container.updateCache();
    // }
  }
}

export default AddChildSystem;
