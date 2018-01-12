import {Phaser} from '../../../util/alias/phaser';

interface TickSystem {
  tick(time: Phaser.Time): void;
}

export default TickSystem;
