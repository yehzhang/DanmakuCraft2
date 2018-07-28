class ConditionalVariable {
  constructor(private readonly callbacks: Array<() => void> = []) {
  }

  notify() {
    const callback = this.callbacks.shift();
    if (!callback) {
      return;
    }

    callback();
  }

  notifyAll() {
    for (const callback of this.callbacks) {
      callback();
    }
    this.callbacks.length = 0;
  }

  async wait(): Promise<void> {
    return new Promise<void>(resolve => this.callbacks.push(resolve));
  }
}

export default ConditionalVariable;
