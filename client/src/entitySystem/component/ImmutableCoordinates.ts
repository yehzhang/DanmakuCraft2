import {throwNominalTypePlaceholderError} from '../../util/nominalType';
import CoordinatesBase from './CoordinatesBase';

class ImmutableCoordinates extends CoordinatesBase {
  __ImmutableCoordinates__() {
    return throwNominalTypePlaceholderError();
  }
}

export default ImmutableCoordinates;
