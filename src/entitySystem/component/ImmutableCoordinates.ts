import Coordinates from './Coordinates';
import {throwNominalTypePlaceholderError} from '../../util/nominalType';

class ImmutableCoordinates extends Coordinates {
  get coordinates(): Phaser.Point {
    return this.coordinates.clone();
  }

  __ImmutableCoordinates__() {
    return throwNominalTypePlaceholderError();
  }
}

export default ImmutableCoordinates;
