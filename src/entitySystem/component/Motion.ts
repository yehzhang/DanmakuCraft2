import Point from '../../util/Point';

class Motion {
  public movedThisTick: boolean;
  public movedDistanceThisTick: Point;

  constructor(public moveSpeedBoostRatio: number, public damping: number) {
    this.movedThisTick = false;
    this.movedDistanceThisTick = Point.origin();
  }
}

export default Motion;
