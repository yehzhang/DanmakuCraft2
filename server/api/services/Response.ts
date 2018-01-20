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
