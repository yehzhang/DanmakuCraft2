import {Component} from '../../alias';
import BaseUpdatingBuff from './BaseUpdatingBuff';

abstract class TimedBuff<T extends Component> extends BaseUpdatingBuff<T> {
  static readonly MAX_LIFETIME = Infinity;

  private lifetime: number;

  constructor(private readonly maxLifetime: number) {
    super();
    this.lifetime = 0;
  }

  tick(component: T, time: Phaser.Time) {
    this.lifetime++;

    if (this.isExpired()) {
      if (this.lifetime === this.maxLifetime) {
        this.unset(component);
      }
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
  protected set(component: T): void {
  }

  /**
   * If {@link maxLifetime} is one or smaller, this method is never called.
   */
  protected update(component: T, time: Phaser.Time): void {
  }

  /**
   * Called when {@link lifetime} reaches {@link maxLifetime} if {@link set} was called before.
   */
  protected unset(component: T): void {
  }
}

export default TimedBuff;
