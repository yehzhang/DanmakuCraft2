import {MovableEntity} from '../../alias';
import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import Controller from '../../../controller/Controller';
import PhysicalConstants from '../../../PhysicalConstants';

class Moving extends PermanentlyUpdatingBuff<MovableEntity> {
  constructor(private controller: Controller) {
    super();
  }

  protected set(entity: MovableEntity) {
  }

  tick(entity: MovableEntity, time: Phaser.Time) {
    let moveDistance = Math.round(PhysicalConstants.PLAYER_MOVE_DISTANCE_PER_SECOND
        * time.physicsElapsed
        * entity.moveSpeedBoostRatio);
    // TODO impl damping
    let moveDistanceX = 0;
    let moveDistanceY = 0;
    if (this.controller.moveLeft) {
      moveDistanceX = -moveDistance;
    }
    if (this.controller.moveRight) {
      moveDistanceX = moveDistance;
    }
    if (this.controller.moveUp) {
      moveDistanceY = -moveDistance;
    }
    if (this.controller.moveDown) {
      moveDistanceY = moveDistance;
    }

    if (moveDistanceX === 0 && moveDistanceY === 0) {
      entity.movedThisTick = false;
      return;
    }

    entity.movedThisTick = true;
    entity.moveBy(moveDistanceX, moveDistanceY);
    entity.movedDistanceThisTick.setTo(moveDistanceX, moveDistanceY);
  }
}

export default Moving;
