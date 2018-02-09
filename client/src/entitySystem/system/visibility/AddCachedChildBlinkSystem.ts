import VisibilitySystem from './VisibilitySystem';
import {StationaryEntity} from '../../alias';
import Blink from '../../component/Blink';
import AddChildSystem from './AddChildSystem';
import Display from '../../component/Display';
import {PIXI} from '../../../util/alias/phaser';

type Target = StationaryEntity & Display & Blink;

class AddCachedChildBlinkSystem implements VisibilitySystem<Target> {
  constructor(
      container: PIXI.DisplayObjectContainer,
      private addCachedChildSystem: AddChildSystem = new AddChildSystem(container, true),
      private addUncachedChildSystem: AddChildSystem = new AddChildSystem(container)) {
  }

  enter(entity: Target) {
    if (entity.hasBlink()) {
      if (entity.isBlinking()) {
        this.addUncachedChildSystem.enter(entity);
        return;
      }
      entity.releaseBlink();
    }
    this.addCachedChildSystem.enter(entity);
  }

  update() {
  }

  exit(entity: Target) {
    if (!entity.hasBlink()) {
      this.addCachedChildSystem.exit(entity);
      return;
    }

    this.addUncachedChildSystem.exit(entity);

    // if (entity.isBlinking()) {
    //   return;
    // }

    entity.releaseBlink();
  }

  finish() {
  }
}

export default AddCachedChildBlinkSystem;
