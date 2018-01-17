class Timeout {
  constructor(private duration: number = 0) {
  }

  static async after(duration: number) {
    return new this(duration).wait();
  }

  async wait() {
    return new Promise(resolve => setTimeout(resolve, this.duration));
  }
}

export default Timeout;
