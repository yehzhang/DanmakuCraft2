class TickCallbackRegister {
  constructor(private callbacks: Array<Callback<any>> = []) {
  }

  async for<T>(callback: () => T, delay: number = 1): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.callbacks.push(new Callback(callback, delay, resolve, reject));
    });
  }

  tick() {
    this.callbacks = this.callbacks.filter(callback => !callback.tick());
  }
}

export default TickCallbackRegister;

class Callback<T> {
  constructor(
      private callback: () => T,
      private delay: number,
      private resolve: (value: T) => void,
      private reject: (reason: Error) => void) {
  }

  tick() {
    if (this.delay > 0) {
      this.delay--;
      return false;
    }

    try {
      let value = this.callback();
      this.resolve(value);
    } catch (e) {
      this.reject(e);
    }

    return true;
  }
}
