import BaseEntityRegister from '../BaseEntityRegister';
import {Phaser} from '../../../../types/phaser';

class GlobalEntityRegister<T> extends BaseEntityRegister<T> {
  constructor(private entities: T[], private entityRegistered: Phaser.Signal<T>) {
    super();
  }

  register(entity: T, dispatchEvent?: boolean): void {
    this.entities.push(entity);
    if (dispatchEvent) {
      this.entityRegistered.dispatch(entity);
    }
  }
}

export default GlobalEntityRegister;
