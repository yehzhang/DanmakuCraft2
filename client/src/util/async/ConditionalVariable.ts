class ConditionalVariable {
  constructor(private callbacks: Array<() => void> = []) {
  }

  notify() {
    let callback = this.callbacks.shift();

    if (callback == null) {
      return;
    }

    callback();
  }

  notifyAll() {
    for (let callback of this.callbacks) {
      callback();
    }
    this.callbacks.length = 0;
  }

  async wait(): Promise<void> {
    return new Promise<void>(resolve => this.callbacks.push(resolve));
  }
}

export default ConditionalVariable;
