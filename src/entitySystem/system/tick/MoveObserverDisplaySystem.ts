import {MovableEntity, Observer, Region} from '../../alias';
import EntityWiseTickSystem from './EntityWiseTickSystem';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

class MoveObserverDisplaySystem extends EntityWiseTickSystem<MovableEntity, Observer> {
  protected onTickEntity(
      entityFinder: EntityFinder<Observer>,
      trackee: MovableEntity,
      currentRegion: Region<Observer>,
      entity: Observer): void {
    if (!entity.movedThisTick) {
      return;
    }

    entity.display.position.x += entity.movedDistanceThisTick.x;
    entity.display.position.y += entity.movedDistanceThisTick.y;
  }
}

export default MoveObserverDisplaySystem;
