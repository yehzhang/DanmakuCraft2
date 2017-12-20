import TickSystem from './TickSystem';

abstract class BaseTickSystem<T> implements TickSystem<T> {
  abstract tick(entity: T): void;
}

export default BaseTickSystem;
