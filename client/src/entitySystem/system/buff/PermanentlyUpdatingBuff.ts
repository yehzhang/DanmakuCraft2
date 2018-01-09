import BaseUpdatingBuff from './BaseUpdatingBuff';
import {Component} from '../../alias';

abstract class PermanentlyUpdatingBuff<T extends Component> extends BaseUpdatingBuff<T> {
  isExpired() {
    return false;
  }
}

export default PermanentlyUpdatingBuff;
