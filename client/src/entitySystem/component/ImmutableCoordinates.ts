import Coordinates from './Coordinates';
import {throwNominalTypePlaceholderError} from '../../util/nominalType';

class ImmutableCoordinates extends Coordinates {
  __ImmutableCoordinates__() {
    return throwNominalTypePlaceholderError();
  }
}

export default ImmutableCoordinates;
