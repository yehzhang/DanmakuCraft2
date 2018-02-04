class Jar<T = string> {
  constructor(private value: T | null = null) {
  }

  set(value?: T) {
    if (value == null) {
      throw new TypeError('Cannot set null in the jar');
    }
    this.value = value;
  }

  get(): T {
    if (this.value == null) {
      throw new TypeError('Jar is empty');
    }
    return this.value;
  }
}

export default Jar;
