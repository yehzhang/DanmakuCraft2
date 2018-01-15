class Timeout {
  constructor(private duration: number = 0) {
  }

  async wait(duration: number = this.duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

export default Timeout;
