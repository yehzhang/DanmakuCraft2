class Sleep {
  private static TIMEOUT_VALUE = {};

  constructor(private duration: number = 0) {
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
    let sleepPromise = this.after(duration);
    let value = await Promise.race([sleepPromise.then(() => this.TIMEOUT_VALUE), promise]);

    if (value === this.TIMEOUT_VALUE) {
      throw new TypeError('Promise timed out');
    }

    return value as T;
  }

  async wait() {
    return new Promise(resolve => setTimeout(resolve, this.duration));
  }
}

export default Sleep;
