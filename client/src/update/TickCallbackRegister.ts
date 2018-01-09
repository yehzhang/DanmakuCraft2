class TickCallbackRegister {
  private static NOOP_CALLBACK = () => {
  };

  constructor(
      private updateCallbacks: Callback[] = [], private renderCallbacks: Callback[] = []) {
  }

  private static async for<T>(callbacks: Callback[], callback: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      callbacks.push(new Callback(callback, resolve, reject));
    });
  }

  private static tickAll(callbacks: Callback[]) {
    for (let callback of callbacks) {
      callback.tick();
    }
    callbacks.length = 0;
  }

  async forUpdate<T>(callback: () => T): Promise<T> {
    return TickCallbackRegister.for(this.updateCallbacks, callback);
  }

  async forRender<T>(callback: () => T): Promise<T> {
    return TickCallbackRegister.for(this.renderCallbacks, callback);
  }

  async forDisplay<T>(callback: () => T): Promise<T> {
    return this.forUpdate(callback);
  }

  async forDisplayPosition<T>(callback: () => T): Promise<T> {
    await this.forDisplay(TickCallbackRegister.NOOP_CALLBACK);
    return this.forRender(callback);
  }

  update() {
    TickCallbackRegister.tickAll(this.updateCallbacks);
  }

  render() {
    TickCallbackRegister.tickAll(this.renderCallbacks);
  }
}

export default TickCallbackRegister;

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
