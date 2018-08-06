import {Phaser} from '../../util/alias/phaser';

interface Coordinates<T extends Phaser.ReadonlyPoint = Phaser.ReadonlyPoint> {
  /**
   * Returns internal coordinates. Modifying them directly may or may not change the internal ones.
   */
  readonly coordinates: T;
}

export default Coordinates;
