import {Component} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

abstract class BaseExistenceSystem<T extends Component> implements ExistenceSystem<T> {
  abstract enter(entity: T): void;

  abstract exit(entity: T): void;

  abstract finish(): void;
}

export default BaseExistenceSystem;
