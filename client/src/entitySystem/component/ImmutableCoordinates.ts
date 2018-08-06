import {toWorldCoordinate2d} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../../util/alias/phaser';
import CoordinatesBase from './CoordinatesBase';

class ImmutableCoordinates extends CoordinatesBase<Phaser.ReadonlyPoint> {
  constructor(coordinates: Phaser.ReadonlyPoint) {
    super(toWorldCoordinate2d(coordinates, PhysicalConstants.WORLD_SIZE));
  }
}

export default ImmutableCoordinates;
