import Point from '../../util/syntax/Point';

class Motion {
  constructor(
      public moveSpeedBoostRatio: number = 1,
      public damping: number = 0,
      public movedThisTick: boolean = false,
      public movedOffsetThisTick: Point = Point.origin()) {
  }
}

export default Motion;
