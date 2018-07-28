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
      private readonly pixelsPerSecond: number = PhysicalConstants.PLAYER_MOVE_PIXELS_PER_SECOND) {
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
        moveEntity(entity, entity.abortMoving());
      }
      entity.isMoving = false;
    } else {
      entity.updateMoving(time);

      if (entity.isMoving) {
        const moveSpeed = this.pixelsPerSecond * time.physicsElapsed * entity.moveSpeedBoostRatio;
        const speed = Math.round(moveSpeed);
        distance.multiply(speed, speed);
      } else {
        entity.startToMove(distance);
        entity.isMoving = true;
      }

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
