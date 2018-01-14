import Coordinates from './Coordinates';
import {toWorldCoordinate2d} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';

class MutableCoordinates extends Coordinates {
  addToCoordinatesBy(distanceX: number, distanceY: number) {
    this.point = toWorldCoordinate2d(
        this.point.add(distanceX, distanceY), PhysicalConstants.WORLD_SIZE);
  }
}

export default MutableCoordinates;
