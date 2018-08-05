import Controller from '../../../input/Controller';
import PhysicalConstants from '../../../PhysicalConstants';
import {Phaser} from '../../../util/alias/phaser';
import Point from '../../../util/syntax/Point';
import {MovableEntity} from '../../alias';
import Nudge from '../../component/Nudge';
import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';

class Moving extends PermanentlyUpdatingBuff<MovableEntity & Nudge> {
  constructor(
      private readonly controller: Controller,
      private readonly pixelsSpeed =
      PhysicalConstants.PLAYER_MOVE_PIXELS_PER_SECOND / Phaser.Timer.SECOND) {
    super();
  }

  tick(entity: MovableEntity & Nudge, time: Phaser.Time) {
    const distance = Point.origin();
    if (this.controller.moveLeft) {
      distance.x = -1;
    }
    if (this.controller.moveRight) {
      distance.x = 1;
    }
    if (this.controller.moveUp) {
      distance.y = -1;
    }
    if (this.controller.moveDown) {
      distance.y = 1;
    }

    if (distance.isZero()) {
      if (entity.isNudging()) {
        moveEntity(entity, entity.abortNudging());
      }
      entity.isMoving = false;
    } else {
      if (entity.isMoving) {
        entity.updateNudging(time.physicsElapsedMS);
      } else {
        entity.startToNudge(distance);
        entity.isMoving = true;
      }

      const speed = this.pixelsSpeed * time.physicsElapsedMS * entity.moveSpeedBoostRatio;
      distance.multiply(speed, speed);

      moveEntity(entity, distance);
    }
  }

  protected set() {
  }
}

function moveEntity(entity: MovableEntity, distance: Point) {
  entity.addToCoordinatesBy(distance);
  entity.movedOffset.add(distance.x, distance.y);
}

export default Moving;
