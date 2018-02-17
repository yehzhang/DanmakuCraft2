import {Component, Updatable} from '../../alias';
import BaseUpdatingBuff from './BaseUpdatingBuff';
import {Phaser} from '../../../util/alias/phaser';

abstract class TimedBuff<T extends Component> extends BaseUpdatingBuff<T> {
  static readonly MAX_LIFETIME = Infinity;

  constructor(
      private maxLifetime: number,
      private lifetime: number = 0,
      private hasUnset: boolean = false) {
    super();
  }

  apply(entity: Updatable<T>) {
    if (this.isExpired()) {
      return;
    }
    super.apply(entity);
  }

  tick(component: T, time: Phaser.Time) {
    if (this.hasUnset) {
      return;
    }

    this.lifetime += time.physicsElapsedMS;

    if (this.isExpired()) {
      this.unset(component);
      this.hasUnset = true;
      return;
    }

    this.update(component, time);
  }

  isExpired() {
    return this.lifetime >= this.maxLifetime;
  }

  /**
   * If {@link maxLifetime} is zero or smaller, this method is never called.
   */
  protected abstract set(component: T): void;

  /**
   * If {@link maxLifetime} is one or smaller, this method is never called.
   */
  protected abstract update(component: T, time: Phaser.Time): void;

  /**
   * Called when {@link lifetime} reaches {@link maxLifetime} if {@link set} was called before.
   */
  protected abstract unset(component: T): void;
}

export default TimedBuff;
