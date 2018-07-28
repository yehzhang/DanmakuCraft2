class Sleep {
  constructor(private readonly duration: number = 0) {
  }

  static async after(duration: number) {
    return new this(duration).wait();
  }

  static async moment() {
    return this.after(0);
  }

  static async break() {
    await this.moment();
    await this.moment();
  }

  static async orError<T>(duration: number, promise: Promise<T>): Promise<T> {
    const sleepPromise = this.after(duration);
    const value = await Promise.race([sleepPromise.then(() => TIMEOUT_VALUE), promise]);

    if (value === TIMEOUT_VALUE) {
      throw new TypeError('Promise timed out');
    }

    return value as T;
  }

  async wait() {
    return new Promise(resolve => setTimeout(resolve, this.duration));
  }
}

const TIMEOUT_VALUE = {};

export default Sleep;
