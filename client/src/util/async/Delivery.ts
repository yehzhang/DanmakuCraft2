import ConditionalVariable from './ConditionalVariable';

class Delivery<T> {
  constructor(
      private data: T | null = null,
      private dataCondition: ConditionalVariable = new ConditionalVariable()) {
  }

  set(data: T) {
    if (this.data != null) {
      return;
    }

    this.data = data;
    this.dataCondition.notifyAll();
  }

  async wait() {
    if (this.data == null) {
      await this.dataCondition.wait();
    }
  }

  get(): T {
    if (this.data == null) {
      throw new TypeError('Data is not available');
    }
    return this.data;
  }
}

export default Delivery;
