import {toWorldCoordinate2d} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import Point from '../../util/syntax/Point';
import CoordinatesBase from './CoordinatesBase';

class MutableCoordinates extends CoordinatesBase {
  addToCoordinatesBy(offset: Point) {
    this.point =
        toWorldCoordinate2d(this.point.add(offset.x, offset.y), PhysicalConstants.WORLD_SIZE);
  }
}

export default MutableCoordinates;
