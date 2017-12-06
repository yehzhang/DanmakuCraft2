import Buff from './Buff';
import {AnimatedEntity} from '../entity/entity';
import Controller from '../controller/Controller';
import PhysicalConstants from '../PhysicalConstants';

export default class Mover extends Buff<AnimatedEntity> {
  constructor(private time: Phaser.Time, private controller: Controller) {
    super(Buff.MAX_LIFETIME);
  }

  update(entity: AnimatedEntity): void {
    let moveDistance = Math.round(
        PhysicalConstants.PLAYER_MOVE_DISTANCE_PER_SECOND * this.time.physicsElapsed);
    if (this.controller.moveLeft) {
      entity.moveBy(-moveDistance, 0);
    }
    if (this.controller.moveRight) {
      entity.moveBy(moveDistance, 0);
    }
    if (this.controller.moveUp) {
      entity.moveBy(0, -moveDistance);
    }
    if (this.controller.moveDown) {
      entity.moveBy(0, moveDistance);
    }
  }
}

// TODO extend Mover: reduce initial move speed
