import {PIXI} from '../../../util/alias/phaser';
import Display from '../../component/Display';
import VisibilitySystem from './VisibilitySystem';

class RenderSystem implements VisibilitySystem<Display> {
  constructor(private readonly layer: PIXI.DisplayObjectContainer) {
  }

  enter(entity: Display) {
    this.layer.addChild(entity.display);
  }

  update(entity: Display) {
  }

  exit(entity: Display) {
    this.layer.removeChild(entity.display);
  }

  finish() {
  }
}

export default RenderSystem;
