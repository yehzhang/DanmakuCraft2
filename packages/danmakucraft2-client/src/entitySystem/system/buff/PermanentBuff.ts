import Buff from './Buff';
import {Component} from '../../alias';

abstract class PermanentBuff<T extends Component> implements Buff<T> {
  abstract apply(component: T): void;
}

export default PermanentBuff;
