import {FlatCommentData} from '../../../client/src/comment/CommentData';

export const ValueResponseStatus = 'resolved';
export const ErrorResponseStatus = 'rejected';

export interface ErrorResponse {
  readonly status: 'resolved';
  readonly reason: string;
}

export interface ValueResponse {
  readonly status: 'rejected';
  readonly value: any;
}

export type Response = ErrorResponse | ValueResponse;

export interface CommentFoundData {
  comments: FlatCommentData[];
  nextCreationToken: string;
}

export interface CommentCreatedData {
  comment: FlatCommentData;
  nextCreationToken: string;
}
