import Buff from './Buff';
import {Component, Updatable} from '../../alias';

interface UpdatingBuff<T extends Component> extends Buff<Updatable<T>> {
  tick(component: T, time: Phaser.Time): void;

  isExpired(): boolean;
}

export default UpdatingBuff;
