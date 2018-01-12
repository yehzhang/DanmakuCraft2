import TickSystem from '../tick/TickSystem';

class SynchronizeLifecycleSystem implements TickSystem {
  private static NOOP_CALLBACK = () => {
  };

  constructor(private callbacks: Callback[] = []) {
  }

  async noop() {
    await this.for(SynchronizeLifecycleSystem.NOOP_CALLBACK);
  }

  async for<T>(callback: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.callbacks.push(new Callback(callback, resolve, reject));
    });
  }

  tick() {
    let callbacks = this.callbacks;
    this.callbacks = [];

    for (let callback of callbacks) {
      callback.tick();
    }
  }
}

export default SynchronizeLifecycleSystem;

class Callback<T = any> {
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
