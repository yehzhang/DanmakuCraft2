import {DisplayableEntity, Region} from '../../alias';
import VisibilitySystem from './VisibilitySystem';

class AddChildToRegionSystem implements VisibilitySystem<Region<DisplayableEntity>> {
  enter(region: Region<DisplayableEntity>) {
    for (let entity of region.container) {
      region.display.addChild(entity.display);
      entity.display.position = entity.asOffsetTo(region.coordinates);
    }
  }

  update(region: Region<DisplayableEntity>, time: Phaser.Time) {
  }

  exit(region: Region<DisplayableEntity>) {
  }

  finish() {
  }
}

export default AddChildToRegionSystem;
