class TickCallbackRegister {
  constructor(private callbacks: Array<Callback<any>> = []) {
  }

  async for<T>(callback: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.callbacks.push(new Callback(callback, resolve, reject));
    });
  }

  tick() {
    for (let callback of this.callbacks) {
      callback.tick();
    }
    this.callbacks.length = 0;
  }
}

export default TickCallbackRegister;

class Callback<T> {
  constructor(
      private callback: () => T,
      private resolve: (value: T) => void,
      private reject: (reason: Error) => void) {
  }

  tick() {
    try {
      let value = this.callback();
      this.resolve(value);
    } catch (e) {
      this.reject(e);
    }
  }
}
