import EntityRegister from './EntityRegister';

abstract class BaseEntityRegister<T> implements EntityRegister<T> {
  abstract count(): number;

  abstract deregister(entity: T, silent?: boolean): void;

  abstract register(entity: T, silent?: boolean): void;

  registerBatch(entities: Iterable<T>, silent?: boolean): void {
    for (let entity of entities) {
      this.register(entity, silent);
    }
  }

  abstract [Symbol.iterator](): Iterator<T>;
}

export default BaseEntityRegister;
