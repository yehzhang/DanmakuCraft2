import {AnimatedEntity} from '../entity/entity';
import {Effect} from './effect';
import {Animated} from '../law';
import EventDispatcher from '../event/EventDispatcher';
import {EventType} from '../event/Event';

/**
 * Manages buffs applied on an entity.
 */
export class BuffManager<T extends AnimatedEntity, E extends EventType = EventType.EFFECT_PLAYER_MOVE>
    extends EventDispatcher<E>
    implements Animated {
  private activatedBuffs: Array<Buff<T, E>>;

  constructor(private readonly entity: T) {
    super();
    this.activatedBuffs = [];
  }

  activate<F extends E>(buff: Buff<T, F>) {
    buff.apply(this.entity);
    this.activatedBuffs.push(buff);
  }

  tick() {
    this.activatedBuffs = this.activatedBuffs.filter(buff => {
      buff.tick(this.entity, this);
      return !buff.isExpired();
    });
  }
}

/**
 * Effect that updates and expires.
 */
export abstract class Buff<T extends AnimatedEntity, E extends EventType> extends Effect<T> {
  private lifetime: number;

  constructor(private readonly maxLifetime: number, parameter?: number) {
    super(parameter);
    this.lifetime = 0;
  }

  apply(entity: T) {
    if (this.isExpired()) {
      return;
    }

    this.set(entity);
  }

  tick(entity: T, eventDispatcher: EventDispatcher<E>): void {
    this.lifetime++;

    if (this.isExpired()) {
      if (this.lifetime === this.maxLifetime) {
        this.unset(entity);
      }
      return;
    }

    this.update(entity, eventDispatcher);
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }

  /**
   * If {@link maxLifetime} is zero or smaller, this method is never called.
   */
  abstract set(entity: T): void;

  /**
   * If {@link maxLifetime} is one or smaller, this method is never called.
   */
  abstract update(entity: T, eventDispatcher: EventDispatcher<E>): void;

  /**
   * Called when {@link lifetime} reaches {@link maxLifetime} if {@link set} was called before.
   */
  abstract unset(entity: T): void;
}
