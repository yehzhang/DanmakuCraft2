interface EntityRegister<T> extends Iterable<T> {
  /**
   * Loads a single entity.
   */
  register(entity: T): void;

  /**
   * Loads an array of entities.
   */
  registerBatch(entities: Iterable<T>): void;

  deregister(entity: T): void;
}

export default EntityRegister;
