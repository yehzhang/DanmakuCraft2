import {Phaser} from '../../util/alias/phaser';
import {Component} from '../alias';
import Buff from '../system/buff/Buff';
import UpdatingBuff from '../system/buff/UpdatingBuff';

/**
 * @template T type of the entity that carries buffs.
 */
class UpdatingBuffCarrier<T extends Component> {
  constructor(private readonly updatingBuffs: Set<UpdatingBuff<T>> = new Set()) {
  }

  static isTypeOf(component: Component): component is UpdatingBuffCarrier<Component> {
    return component.hasOwnProperty('updatingBuffs');
  }

  /**
   * It is not safe to call this method directly.
   * Call {@link Buff.apply} instead.
   */
  addBuff(buff: UpdatingBuff<T>) {
    if (!buff.isExpired()) {
      this.updatingBuffs.add(buff);
    }
    return this;
  }

  tick(entity: T, time: Phaser.Time) {
    for (const buff of this.updatingBuffs) {
      buff.tick(entity, time);
      if (buff.isExpired()) {
        this.updatingBuffs.delete(buff);
      }
    }
  }
}

export default UpdatingBuffCarrier;
