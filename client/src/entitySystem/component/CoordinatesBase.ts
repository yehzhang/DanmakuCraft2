import {Phaser} from '../../util/alias/phaser';
import Coordinates from './Coordinates';

abstract class CoordinatesBase<T extends Phaser.ReadonlyPoint> implements Coordinates<T> {
  constructor(readonly coordinates: T) {
  }
}

export default CoordinatesBase;
