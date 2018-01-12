import {Updatable} from '../../alias';
import {Phaser} from '../../../util/alias/phaser';
import ExistenceSystem from './ExistenceSystem';

class UpdateSystem implements ExistenceSystem<Updatable> {
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
