import Coordinates from './Coordinates';
import {toWorldCoordinate2d} from '../../law';
import PhysicalConstants from '../../PhysicalConstants';
import Point from '../../util/syntax/Point';

class MutableCoordinates extends Coordinates {
  get coordinates(): Point {
    return this.point;
  }

  moveBy(distanceX: number, distanceY: number) {
    this.point = toWorldCoordinate2d(
        this.point.add(distanceX, distanceY), PhysicalConstants.WORLD_SIZE);
  }
}

export default MutableCoordinates;
