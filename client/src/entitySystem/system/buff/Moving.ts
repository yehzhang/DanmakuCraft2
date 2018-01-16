import {MovableEntity} from '../../alias';
import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import Controller from '../../../input/Controller';
import PhysicalConstants from '../../../PhysicalConstants';
import {Phaser} from '../../../util/alias/phaser';
import Point from '../../../util/syntax/Point';

class Moving extends PermanentlyUpdatingBuff<MovableEntity> {
  private static readonly PAUSING_DURATION = 90;

  constructor(
      private controller: Controller,
      private pixelsPerSecond: number = PhysicalConstants.PLAYER_MOVE_PIXELS_PER_SECOND) {
    super();
  }

  tick(entity: MovableEntity, time: Phaser.Time) {
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
      entity.isMoving = false;
    } else {
      this.moveEntityWithInitialPausing(entity, time, distance);
      entity.isMoving = true;
    }
  }

  private moveEntityWithInitialPausing(entity: MovableEntity, time: Phaser.Time, distance: Point) {
    if (entity.isMoving) {
      entity.pausingDuration -= time.physicsElapsedMS;
      if (entity.pausingDuration > 0) {
        return;
      }

      let moveSpeed = this.pixelsPerSecond * time.physicsElapsed * entity.moveSpeedBoostRatio;
      let laggingMultiplier = time.elapsedMS / time.physicsElapsedMS;
      let speed = Math.round(moveSpeed * laggingMultiplier);
      distance.multiply(speed, speed);
    } else {
      entity.pausingDuration = Moving.PAUSING_DURATION;
    }

    entity.addToCoordinatesBy(distance);
    entity.movedOffset.add(distance.x, distance.y);
  }

  protected set(entity: MovableEntity) {
  }
}

export default Moving;
