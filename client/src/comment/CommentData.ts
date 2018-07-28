import {BuffData} from '../entitySystem/system/buff/BuffData';
import Point from '../util/syntax/Point';

class CommentData {
  readonly coordinates: Point;

  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      coordinates: Point,
      readonly buffData: BuffData | null) {
    this.coordinates = coordinates.clone().floor();
  }

  static structureFrom(flatData: FlatCommentData) {
    let buffData;
    if (flatData.buffType != null && flatData.buffParameter != null) {
      buffData = new BuffData(flatData.buffType, flatData.buffParameter);
    } else {
      buffData = null;
    }

    return new CommentData(
        flatData.size,
        flatData.color,
        flatData.text,
        Point.of(flatData.coordinateX, flatData.coordinateY),
        buffData);
  }

  flatten(): FlatCommentData {
    const flatData: any = {
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
