class Timeout {
  private static MOMENT_DURATION = 100;

  constructor(private duration: number = 0) {
  }

  static async after(duration: number) {
    return new this(duration).wait();
  }

  static async moment() {
    return this.after(this.MOMENT_DURATION);
  }

  async wait() {
    return new Promise(resolve => setTimeout(resolve, this.duration));
  }
}

export default Timeout;
