import Coordinates from './Coordinates';
import {throwNominalTypePlaceholderError} from '../../util/nominalType';
import Point from '../../util/Point';

class ImmutableCoordinates extends Coordinates {
  get coordinates(): Point {
    return this.point.clone();
  }

  __ImmutableCoordinates__() {
    return throwNominalTypePlaceholderError();
  }
}

export default ImmutableCoordinates;
