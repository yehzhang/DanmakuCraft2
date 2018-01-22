class Sleep {
  constructor(private duration: number = 0) {
  }

  static async after(duration: number) {
    return new this(duration).wait();
  }

  static async immediate() {
    return new Promise(setImmediate);
  }

  async wait() {
    return new Promise(resolve => setTimeout(resolve, this.duration));
  }
}

export default Sleep;
