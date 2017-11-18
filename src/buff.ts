import {AnimatedEntity} from './entity';
import {Effect} from './effect';
import {Animated} from './law';

/**
 * Manages buffs applied on an entity.
 */
export class BuffManager<E extends AnimatedEntity> implements Animated {
  private activatedBuffs: Array<Buff<E>>;

  constructor(private readonly entity: E) {
    this.activatedBuffs = [];
  }

  activate(buff: Buff<E>) {
    buff.initialize(this.entity);
    this.activatedBuffs.push(buff);
  }

  tick() {
    this.activatedBuffs = this.activatedBuffs.filter(buff => {
      buff.tick();

      if (buff.isExpired()) {
        buff.reset(this.entity);
        return false;
      } else {
        buff.update(this.entity);
        return true;
      }
    });
  }
}

/**
 * Effect that updates and expires.
 */
export abstract class Buff<E extends AnimatedEntity> extends Effect<E> implements Animated {
  private ticks: number;

  constructor(private readonly lifetime: number, parameter?: number) {
    super(parameter);
    this.ticks = 0;
  }

  tick() {
    this.ticks++;
  }

  isExpired() {
    return this.ticks >= this.lifetime;
  }

  abstract update(entity: E): void;

  abstract reset(entity: E): void;
}
