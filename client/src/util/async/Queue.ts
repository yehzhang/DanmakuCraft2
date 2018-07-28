import ConditionalVariable from './ConditionalVariable';

class Queue<T> {
  constructor(
      private readonly values: T[] = [],
      private readonly pushCondition: ConditionalVariable = new ConditionalVariable(),
      private readonly popCondition: ConditionalVariable = new ConditionalVariable()) {
  }

  async push(valueOrPromise: Promise<T> | T) {
    const value = await valueOrPromise;
    this.values.push(value);
    this.pushCondition.notify();

    return this.popCondition.wait();
  }

  async shift(): Promise<T> {
    if (this.values.length === 0) {
      await this.pushCondition.wait();
    }

    if (this.values.length === 0) {
      throw new TypeError('Notified but no values were available');
    }

    this.popCondition.notify();

    return this.values.shift() as T;
  }
}

export default Queue;
