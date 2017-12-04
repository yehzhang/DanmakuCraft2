import {AnimatedEntity} from '../entity/entity';
import {Animated} from '../law';
import Buff from './Buff';

/**
 * Manages buffs applied on an entity.
 */
export class BuffManager<T extends AnimatedEntity> implements Animated {
  private activatedBuffs: Array<Buff<T>>;

  constructor(private readonly entity: T) {
    this.activatedBuffs = [];
  }

  activate(buff: Buff<T>) {
    buff.apply(this.entity);

    this.activatedBuffs.push(buff);

    return this;
  }

  tick() {
    this.activatedBuffs = this.activatedBuffs.filter(buff => {
      buff.tick(this.entity);
      return !buff.isExpired();
    });
  }
}
