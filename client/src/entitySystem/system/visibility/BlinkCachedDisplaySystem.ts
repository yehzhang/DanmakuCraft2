import VisibilitySystem from './VisibilitySystem';
import {Region, StationaryEntity} from '../../alias';
import Blink from '../../component/Blink';
import UnmovableDisplayPositioningSystem from './UnmovableDisplayPositioningSystem';
import AddChildSystem from './AddChildSystem';
import Display from '../../component/Display';
import {asSequence} from 'sequency';
import AddChildToRegionSystem from '../existence/AddChildToRegionSystem';

type Target = Region<StationaryEntity & Display & Blink>;

class BlinkCachedDisplaySystem implements VisibilitySystem<Target> {
  constructor(
      private positioningSystem: UnmovableDisplayPositioningSystem,
      private addCachedChildSystem: AddChildSystem,
      private addUncachedChildSystem: AddChildSystem) {
  }

  enter(region: Target) {
    for (let entity of region.container) {
      if (entity.hasBlink()) {
        if (entity.isBlinking()) {
          entity.display.visible = true;
          this.addUncachedChildSystem.enter(entity);
          this.positioningSystem.enter(entity);
        } else {
          entity.releaseBlink();

          AddChildToRegionSystem.adopt(entity, region);
          this.addCachedChildSystem.enter(entity);
        }
      } else {
        if (entity.display.parent == null) {
          AddChildToRegionSystem.adopt(entity, region);
          this.addCachedChildSystem.enter(entity);
        }
      }
    }
  }

  update() {
  }

  exit(region: Target) {
    asSequence(region.container)
        .filter(entity => entity.hasBlink())
        .onEach(entity => this.addUncachedChildSystem.exit(entity))
        .filter(entity => !entity.isBlinking())
        .forEach(entity => entity.releaseBlink());
  }

  finish() {
  }
}

export default BlinkCachedDisplaySystem;
