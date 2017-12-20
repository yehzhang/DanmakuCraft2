import {Updatable} from '../../alias';
import BaseTickSystem from './BaseTickSystem';

class UpdateSystem extends BaseTickSystem<Updatable> {
  constructor(private time: Phaser.Time) {
    super();
  }

  tick(entity: Updatable) {
    entity.tick(entity, this.time);
  }
}

export default UpdateSystem;
