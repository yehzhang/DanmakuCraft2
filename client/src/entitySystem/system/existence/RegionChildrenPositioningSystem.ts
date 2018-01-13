import {Region} from '../../alias';
import ExistenceSystem from './ExistenceSystem';
import Display from '../../component/Display';
import Entity from '../../Entity';

class RegionChildrenPositioningSystem implements ExistenceSystem<Region<Entity & Display>> {
  adopt(region: Region<Entity & Display>) {
    for (let entity of region.container) {
      entity.display.position = entity.asOffsetTo(region.coordinates);
      region.display.addChild(entity.display);
    }
  }

  abandon(region: Region<Entity & Display>) {
  }
}

export default RegionChildrenPositioningSystem;
