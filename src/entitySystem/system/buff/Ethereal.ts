import PermanentBuff from './PermanentBuff';
import {Component} from '../../alias';

/**
 * Nothing.
 */
class Ethereal extends PermanentBuff<Component> {
  private static instance = new Ethereal();

  private constructor() {
    super();
  }

  static getInstance() {
    return this.instance;
  }

  apply() {
  }
}

export default Ethereal;
