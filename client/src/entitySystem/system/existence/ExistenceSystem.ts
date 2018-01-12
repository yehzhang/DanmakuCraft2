import {Component} from '../../alias';

interface ExistenceSystem<T extends Component> {
  adopt(component: T): void;

  abandon(component: T): void;
}

export default ExistenceSystem;
