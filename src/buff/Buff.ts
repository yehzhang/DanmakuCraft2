import {AnimatedEntity} from '../entity/entity';

/**
 * Effect that updates and expires.
 */
export default abstract class Buff<T extends AnimatedEntity> {
  static readonly MAX_LIFETIME = Infinity;

  private lifetime: number;

  constructor(private readonly maxLifetime: number) {
    this.lifetime = 0;
  }

  apply(entity: T) {
    if (this.isExpired()) {
      return;
    }

    this.set(entity);
  }

  tick(entity: T): void {
    this.lifetime++;

    if (this.isExpired()) {
      if (this.lifetime === this.maxLifetime) {
        this.unset(entity);
      }
      return;
    }

    this.update(entity);
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }

  /**
   * If {@link maxLifetime} is zero or smaller, this method is never called.
   */
  set(entity: T): void {
  }

  /**
   * If {@link maxLifetime} is one or smaller, this method is never called.
   */
  update(entity: T): void {
  }

  /**
   * Called when {@link lifetime} reaches {@link maxLifetime} if {@link set} was called before.
   */
  unset(entity: T): void {
  }
}
