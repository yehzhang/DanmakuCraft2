import EntityRegister from './EntityRegister';

abstract class BaseEntityRegister<T> implements EntityRegister<T> {
  abstract register(entity: T, dispatchEvent?: boolean): void;

  registerBatch(entities: Iterable<T>, dispatchEvent = true): void {
    for (let entity of entities) {
      this.register(entity, dispatchEvent);
    }
  }
}

export default BaseEntityRegister;
