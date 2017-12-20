import {Component} from '../../alias';

interface TickSystem<T = Component> {
  tick(entity: T): void;
}

export default TickSystem;
