import {PIXI} from '../../../util/alias/phaser';
import Display from '../../component/Display';
import VisibilitySystem from './VisibilitySystem';

class RenderSystem implements VisibilitySystem<Display> {
  constructor(private readonly layer: PIXI.DisplayObjectContainer) {
  }

  enter(entity: Display) {
    this.layer.addChild(entity.display);
    if (__DEV__) {
      (window as any).d.showBoundsOf(entity);
    }
  }

  update(entity: Display) {
  }

  exit(entity: Display) {
    this.layer.removeChild(entity.display);
    if (__DEV__) {
      (window as any).d.hideBoundsOf(entity);
    }
  }

  finish() {
  }
}

export default RenderSystem;
