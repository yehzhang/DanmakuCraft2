import {Component, Updatable} from '../../alias';
import UpdatingBuff from './UpdatingBuff';

abstract class BaseUpdatingBuff<T extends Component> implements UpdatingBuff<T> {
  apply(entity: Updatable<T>) {
    this.set(entity);
    entity.addBuff(this);
  }

  tick(component: T, time: Phaser.Time) {
  }

  abstract isExpired(): boolean;

  protected set(entity: T) {
  }
}

export default BaseUpdatingBuff;
