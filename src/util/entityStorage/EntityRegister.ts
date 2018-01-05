interface EntityRegister<T> {
  /**
   * Loads a single entity.
   */
  register(entity: T, silent?: boolean): void;

  /**
   * Loads an array of entities.
   */
  registerBatch(entities: Iterable<T>, silent?: boolean): void;

  deregister(entity: T, silent?: boolean): void;

  count(): number;
}

export default EntityRegister;
