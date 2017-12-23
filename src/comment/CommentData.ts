import {BuffData} from '../entitySystem/system/buff/BuffFactory';

class CommentData {
  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      readonly coordinateX: number, // These positions may be invalid.
      readonly coordinateY: number,
      readonly buffData: BuffData | null) {
  }
}

export default CommentData;
