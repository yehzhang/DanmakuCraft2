import BuffType from './BuffType';

export interface FlatCommentDataRequest {
  readonly size: number;
  readonly color: number;
  readonly text: string;
  readonly coordinateX: number;
  readonly coordinateY: number;
  readonly buffType?: BuffType;
  readonly buffParameter?: number;
}

export interface FlatCommentDataResponse {
  readonly size: number;
  readonly color: number;
  readonly text: string;
  readonly coordinateX: number;
  readonly coordinateY: number;
  readonly buffType?: BuffType;
  readonly buffParameter?: number;
  readonly createdAt: number;
}
