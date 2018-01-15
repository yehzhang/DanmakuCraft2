import {BuffData} from '../entitySystem/system/buff/BuffData';
import Point from '../util/syntax/Point';

class CommentData {
  readonly coordinates: Point;

  // TODO subtitle comment
  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      coordinates: Point,
      readonly buffData: BuffData | null) {
    this.coordinates = coordinates.clone().floor();
  }
}

export default CommentData;
