import {BuffData} from '../entitySystem/system/buff/BuffFactory';

class BuffDataContainer {
  constructor(private maxBuffDatasCount = 1, private buffDatas: BuffData[] = []) {
  }

  add(buffData: BuffData) {
    this.buffDatas.push(buffData);
    if (this.buffDatas.length > this.maxBuffDatasCount) {
      this.buffDatas.shift();
    }
  }

  hasBuff() {
    return this.buffDatas.length !== 0;
  }

  pop(): void {
    let buff = this.buffDatas.shift();

    if (buff == null) {
      throw new Error('No buff data available');
    }
  }

  peek() {
    if (!this.hasBuff()) {
      throw new Error('No buff data available');
    }

    return this.buffDatas[0];
  }
}

export default BuffDataContainer;
