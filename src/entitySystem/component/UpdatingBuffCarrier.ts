import {Component} from '../alias';
import UpdatingBuff from '../system/buff/UpdatingBuff';
import Buff from '../system/buff/Buff';

/**
 * @template T type of the entity that carries buffs.
 */
class UpdatingBuffCarrier<T extends Component> {
  private updatingBuffs: Array<UpdatingBuff<T>>;

  constructor() {
    this.updatingBuffs = [];
  }

  /**
   * It is not safe to call this method directly.
   * Call {@link Buff.apply} instead.
   */
  addBuff(buff: UpdatingBuff<T>) {
    if (!buff.isExpired()) {
      this.updatingBuffs.push(buff);
    }
    return this;
  }

  tick(entity: T, time: Phaser.Time) {
    this.updatingBuffs = this.updatingBuffs.filter(buff => {
      buff.tick(entity, time);
      return !buff.isExpired();
    });
  }
}

export default UpdatingBuffCarrier;
