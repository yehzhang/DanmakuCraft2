import Point from '../../util/syntax/Point';

class Motion {
  constructor(
      public moveSpeedBoostRatio: number = 1,
      public pausingDuration: number = 0,
      public isMoving: boolean = false, // Should be modified by Moving only
      public movedOffset: Point = Point.origin()) {
  }
}

export default Motion;
