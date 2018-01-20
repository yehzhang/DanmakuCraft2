import ConditionalVariable from './ConditionalVariable';

class Queue<T> {
  constructor(
      private values: T[] = [],
      private pushCondition: ConditionalVariable = new ConditionalVariable(),
      private popCondition: ConditionalVariable = new ConditionalVariable()) {
  }

  async shift(valueOrPromise: Promise<T> | T) {
    let value = await valueOrPromise;
    this.values.push(value);
    this.pushCondition.notify();

    return this.popCondition.wait();
  }

  async unshift(): Promise<T> {
    if (this.values.length === 0) {
      await this.pushCondition.wait();
    }

    let value = this.values.shift();
    if (value == null) {
      throw new TypeError('Notified but no values were available');
    }

    this.popCondition.notify();

    return value;
  }
}

export default Queue;
