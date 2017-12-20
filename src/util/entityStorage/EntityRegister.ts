interface EntityRegister<T> {
  /**
   * Loads a single entity.
   */
  register(entity: T, dispatchEvent?: boolean): void;

  /**
   * Loads an array of entities.
   */
  registerBatch(entities: Iterable<T>, dispatchEvent?: boolean): void;
}

export default EntityRegister;
