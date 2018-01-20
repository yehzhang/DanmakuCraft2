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

  static structureFrom(
      size: number,
      color: number,
      text: string,
      coordinateX: number,
      coordinateY: number,
      buffType?: number,
      buffParameter?: number) {
    let buffData;
    if (buffType != null && buffParameter != null) {
      buffData = new BuffData(buffType, buffParameter);
    } else {
      buffData = null;
    }

    return new CommentData(size, color, text, Point.of(coordinateX, coordinateY), buffData);
  }

  flatten(): FlatCommentData {
    let flatData: any = {
      size: this.size,
      color: this.color,
      text: this.text,
      coordinateX: this.coordinates.x,
      coordinateY: this.coordinates.y,
    };
    if (this.buffData != null) {
      flatData.buffType = this.buffData.type;
      flatData.buffParameter = this.buffData.parameter;
    }

    return flatData;
  }
}

export default CommentData;

export interface FlatCommentData {
  readonly size: number;
  readonly color: number;
  readonly text: string;
  readonly coordinateX: number;
  readonly coordinateY: number;
  readonly buffType?: number;
  readonly buffParameter?: number;
}
