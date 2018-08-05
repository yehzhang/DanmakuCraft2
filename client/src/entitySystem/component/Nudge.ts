import {toWorldCoordinateOffset2d} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Phaser} from '../../util/alias/phaser';
import Point from '../../util/syntax/Point';
import Entity from '../Entity';

class Nudge {
  private static readonly NUDGING_DURATION = 70;

  constructor(public nudgingDuration: number = 0, public nudgeDestination: Point = Point.origin()) {
  }

  startToNudge(this: Entity & Nudge, initialDistance: Point) {
    this.nudgingDuration = Nudge.NUDGING_DURATION;
    this.nudgeDestination = Phaser.Point.add(this.coordinates, initialDistance);
  }

  updateNudging(elapsed: number) {
    this.nudgingDuration -= elapsed;
  }

  abortNudging(this: Entity & Nudge): Point {
    this.nudgingDuration = 0;
    return toWorldCoordinateOffset2d(
        this.nudgeDestination,
        this.coordinates,
        PhysicalConstants.WORLD_SIZE);
  }

  isNudging() {
    return this.nudgingDuration > 0;
  }
}

export default Nudge;
