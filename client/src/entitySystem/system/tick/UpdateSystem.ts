import {Updatable} from '../../alias';
import TickSystem from './TickSystem';
import {Phaser} from '../../../util/alias/phaser';

class UpdateSystem implements TickSystem<Updatable> {
  constructor(private time: Phaser.Time) {
  }

  update(entity: Updatable, time: Phaser.Time) {
    entity.tick(entity, this.time);
  }

  tick(time: Phaser.Time) {
  }
}

export default UpdateSystem;
