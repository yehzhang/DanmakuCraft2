import {BuffData, BuffType} from '../entitySystem/system/buff/BuffFactory';
import Buff from '../entitySystem/system/buff/Buff';

class LocallyOriginatedCommentBuffContainer {
  private inactiveBuffs: Buff[];

  constructor(private maxActivatedBuffsCount = 1) {
    this.inactiveBuffs = [];
  }

  private static toBuffData(buff: Buff) {
    let buffName = buff.constructor.name.toUpperCase();
    let buffType = (BuffType as any)[buffName];
    return new BuffData(buffType, 0);
  }

  add(buff: Buff) {
    this.inactiveBuffs.push(buff);
    if (this.inactiveBuffs.length > this.maxActivatedBuffsCount) {
      this.inactiveBuffs.shift();
    }
  }

  hasBuff() {
    return this.inactiveBuffs.length !== 0;
  }

  pop(): void {
    let buff = this.inactiveBuffs.shift();

    if (buff == null) {
      throw new Error('No buff to activate');
    }
  }

  peek() {
    if (!this.hasBuff()) {
      throw new Error('No buff to peek');
    }

    return LocallyOriginatedCommentBuffContainer.toBuffData(this.inactiveBuffs[0]);
  }
}

export default LocallyOriginatedCommentBuffContainer;
