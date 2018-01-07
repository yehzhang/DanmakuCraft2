import {Component, Updatable} from '../../alias';
import UpdatingBuff from './UpdatingBuff';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

abstract class BaseUpdatingBuff<T extends Component> implements UpdatingBuff<T> {
  apply(entity: Updatable<T>) {
    this.set(entity);
    entity.addBuff(this);
  }

  abstract tick(component: T, time: Phaser.Time): void;

  abstract isExpired(): boolean;

  protected abstract set(entity: T): void;
}

export default BaseUpdatingBuff;
