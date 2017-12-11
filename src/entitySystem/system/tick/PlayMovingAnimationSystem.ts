import {MovableEntity, Region} from '../../alias';
import MovingAnimation from '../../component/MovingAnimation';
import EntityWiseTickSystem from './EntityWiseTickSystem';
import EntityFinder from '../../../util/entityFinder/EntityFinder';

type EntityType = MovableEntity & MovingAnimation;

class PlayMovingAnimationSystem extends EntityWiseTickSystem<MovableEntity, EntityType> {
  protected onTickEntity(
      entityFinder: EntityFinder<EntityType>,
      trackee: MovableEntity,
      currentRegion: Region<EntityType>,
      entity: EntityType): void {
    if (entity.movedThisTick) {
      if (!entity.movingAnimation.isPlaying) {
        entity.movingAnimation.play();
        entity.movingAnimation.frame = 1;
      }
      entity.movedThisTick = false;
    } else {
      if (entity.movingAnimation.isPlaying) {
        entity.movingAnimation.stop(true);
      }
    }
  }
}

export default PlayMovingAnimationSystem;
