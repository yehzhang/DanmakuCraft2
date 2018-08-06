import {toWorldCoordinate2d} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../../util/alias/phaser';
import Point from '../../util/syntax/Point';
import CoordinatesBase from './CoordinatesBase';

class MutableCoordinates extends CoordinatesBase<Point> {
  constructor(coordinates: Phaser.ReadonlyPoint) {
    super(toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE));
  }

  addToCoordinatesBy(offset: Point) {
    this.coordinates.copyFrom(toWorldCoordinate2d(
        this.coordinates.add(offset.x, offset.y),
        PhysicalConstants.WORLD_SIZE));
  }
}

export default MutableCoordinates;
