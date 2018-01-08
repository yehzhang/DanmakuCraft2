import {BuffData} from '../entitySystem/system/buff/BuffFactory';
import Point from '../util/syntax/Point';

class CommentData {
  readonly coordinates: Point;

  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      coordinates: Point,
      readonly buffData: BuffData | null) {
    this.coordinates = coordinates.clone();
  }
}

export default CommentData;
