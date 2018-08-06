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

  // TODO remove
  commitUpdate() {
    this.dirty = false;
  }

  // TODO force commit
  getValue() {
    return this.value;
  }
}

export default DynamicProvider;
