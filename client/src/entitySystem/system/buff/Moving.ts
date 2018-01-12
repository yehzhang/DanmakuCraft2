import {MovableEntity} from '../../alias';
import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import Controller from '../../../controller/Controller';
import PhysicalConstants from '../../../PhysicalConstants';
import {Phaser} from '../../../util/alias/phaser';

class Moving extends PermanentlyUpdatingBuff<MovableEntity> {
  constructor(private controller: Controller) {
    super();
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
      return;
    }

    entity.moveBy(moveDistanceX, moveDistanceY);
    entity.movedOffset.add(moveDistanceX, moveDistanceY);
  }

  protected set(entity: MovableEntity) {
  }
}

export default Moving;
