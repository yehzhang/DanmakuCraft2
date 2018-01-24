import Point from '../../util/syntax/Point';

class Motion {
  constructor(
      public moveSpeedBoostRatio: number = 1,
      public movedOffset: Point = Point.origin(),
      public isMoving: boolean = false) {
  }
}

export default Motion;
