class DynamicProvider<T> {
  constructor(private value: T, private dirty: boolean = false) {
  }

  update(value: T) {
    if (value === this.value) {
      return;
    }

    this.value = value;
    this.dirty = true;
  }

  hasUpdate() {
    return this.dirty;
  }

  commitUpdate() {
    this.dirty = false;
  }

  getValue() {
    return this.value;
  }
}

export default DynamicProvider;
