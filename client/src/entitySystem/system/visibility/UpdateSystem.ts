import {Updatable} from '../../alias';
import {Phaser} from '../../../util/alias/phaser';
import VisibilitySystem from './VisibilitySystem';

class UpdateSystem implements VisibilitySystem<Updatable> {
  enter(entity: Updatable) {
  }

  update(entity: Updatable, time: Phaser.Time) {
    entity.tick(entity, time);
  }

  exit(entity: Updatable) {
  }

  finish() {
  }
}

export default UpdateSystem;
