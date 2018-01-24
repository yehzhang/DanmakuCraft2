import {MovableEntity} from '../../alias';
import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import Controller from '../../../input/Controller';
import PhysicalConstants from '../../../PhysicalConstants';
import {Phaser} from '../../../util/alias/phaser';
import Point from '../../../util/syntax/Point';
import Nudge from '../../component/Nudge';

class Moving extends PermanentlyUpdatingBuff<MovableEntity & Nudge> {
  constructor(
      private controller: Controller,
      private pixelsPerSecond: number = PhysicalConstants.PLAYER_MOVE_PIXELS_PER_SECOND) {
    super();
  }

  private static moveEntity(entity: MovableEntity, distance: Point) {
    entity.addToCoordinatesBy(distance);
    entity.movedOffset.add(distance.x, distance.y);
  }

  tick(entity: MovableEntity & Nudge, time: Phaser.Time) {
    let distance = Point.origin();
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
        Moving.moveEntity(entity, entity.abortMoving());
      }
      entity.isMoving = false;
    } else {
      entity.updateMoving(time);

      if (entity.isMoving) {
        let moveSpeed = this.pixelsPerSecond * time.physicsElapsed * entity.moveSpeedBoostRatio;
        let speed = Math.round(moveSpeed);
        distance.multiply(speed, speed);
      } else {
        entity.startToMove(distance);
        entity.isMoving = true;
      }

      Moving.moveEntity(entity, distance);
    }
  }

  protected set() {
  }
}

export default Moving;
