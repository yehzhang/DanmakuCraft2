import { Color } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import checkExhaustive from '../checkExhaustive';
import logErrorMessage from '../logging/logErrorMessage';
import track from '../logging/track';
import { applicationId, javaScriptKey, serverUrl } from './config';

function fetchBackend(
  path: 'users',
  method: 'POST',
  payload: KeyValuePayload<{ username: string; email: string; password: string }>
): Result<User, UserSignUpErrorType>;
function fetchBackend(
  path: 'login',
  method: 'POST',
  payload: KeyValuePayload<{ username: string; password: string }>
): Result<User, UserSignInErrorType>;
function fetchBackend(
  path: 'users/me',
  method: 'GET',
  payload: SessionTokenPayload
): Result<void, InvalidSessionTokenErrorType>;
function fetchBackend(
  path: 'requestPasswordReset' | 'verificationEmailRequest',
  method: 'POST',
  payload: KeyValuePayload<{ email: string }>
): Result<void, never>;
function fetchBackend(
  path: 'classes/Entity',
  method: 'GET',
  payload: QueryPayload<CommentEntity>
): Result<QueryResult<CommentEntity>, 'unknown'>;
function fetchBackend(
  path: 'classes/Entity',
  method: 'POST',
  payload: ParseObjectPayload<CommentEntity>
): Result<ParseObject, 'unknown'>;
function fetchBackend(
  path: 'classes/BilibiliUserComment',
  method: 'POST',
  payload: ParseObjectPayload<{ bilibiliUserId: string; commentEntityId: string }>
): Result<ParseObject, 'unknown'>;
async function fetchBackend(
  path:
    | 'users'
    | 'users/me'
    | 'login'
    | 'classes/Entity'
    | 'classes/BilibiliUserComment'
    | 'requestPasswordReset'
    | 'verificationEmailRequest',
  method: 'GET' | 'POST',
  payload: Payload
): Result<ResolvedValue, ErrorType> {
  // Make API call.
  const url = new URL(path, serverUrl);
  const jsonPayload = getJsonPayload(payload);
  if (method === 'GET' && jsonPayload) {
    Object.entries(jsonPayload).forEach(
      ([key, value]) => void url.searchParams.append(key, JSON.stringify(value))
    );
  }
  const sessionToken = getSessionToken(payload);
  const response = await fetch(url.href, {
    method,
    headers: {
      'X-Parse-Application-Id': applicationId,
      'X-Parse-Javascript-Key': javaScriptKey,
      ...(path === 'users' || path === 'classes/Entity'
        ? {
            'Content-Type': 'application/json',
          }
        : null),
      ...(path === 'users' || path === 'login'
        ? {
            'X-Parse-Revocable-Session': '1',
          }
        : null),
      ...(sessionToken !== null
        ? {
            'X-Parse-Session-Token': sessionToken,
          }
        : null),
    },
    body: method === 'POST' && jsonPayload ? JSON.stringify(jsonPayload) : null,
  });

  // Track API call.
  const responseJson = await response.json();
  const success = typeof responseJson === 'object' && !responseJson.error;
  track('Backend Fetch', {
    success,
    path,
    method,
    payload,
    errorMessage: responseJson.error,
    errorCode: success ? undefined : responseJson.code,
  });

  if (success) {
    return { type: 'resolved', value: responseJson };
  }

  // Parse error.
  const { code: errorCode } = responseJson;
  if (path === 'users') {
    if (errorCode === 202 || errorCode === 203) {
      return { type: 'rejected', errorType: 'username_taken' };
    }
  } else if (path === 'login') {
    if (errorCode === 101) {
      return { type: 'rejected', errorType: 'invalid_username_or_password' };
    }
  } else if (path === 'users/me') {
    if (errorCode === 209) {
      return { type: 'rejected', errorType: 'invalid_session_token' };
    }
  } else if (path === 'classes/Entity' || path === 'classes/BilibiliUserComment') {
    // Fallthrough.
  } else if (path === 'requestPasswordReset' || path === 'verificationEmailRequest') {
    // Swallow the backend error internally.
    logErrorMessage('Expected valid error code', { path, errorCode });
    return { type: 'resolved', value: undefined };
  } else {
    checkExhaustive(path);
  }
  // Fallback for all unexpected errors. This indicates client side assumptions are broken.
  logErrorMessage('Expected valid error code', { path, errorCode });
  return { type: 'rejected', errorType: 'unknown' };
}

interface KeyValuePayload<T extends Record<string, unknown>> {
  type: 'key_value';
  data: T;
}
interface SessionTokenPayload {
  type: 'session_token';
  sessionToken: string;
}
interface QueryPayload<T extends Attributes> {
  type: 'query';
  sessionToken: string;
  order: { [_ in keyof T]?: 1 | -1 };
  limit: number;
}
interface ParseObjectPayload<T extends Attributes> {
  type: 'parse_object';
  data: OutboundAttributes<Serializable<T>>;
  sessionToken: string;
}
type Payload =
  | KeyValuePayload<Record<string, unknown>>
  | ParseObjectPayload<Attributes>
  | SessionTokenPayload
  | QueryPayload<Attributes>;

interface Attributes {
  readonly [key: string]: any;
}
export type InboundAttributes<T extends Attributes> = {
  [P in keyof UnionToIntersectionHack<T> | BuiltInAttributes]?: unknown;
};
type UnionToIntersectionHack<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
export type OutboundAttributes<T extends Parse.Attributes> = T extends unknown
  ? Omit<T, BuiltInAttributes>
  : never;
type Serializable<T extends Attributes> = { [K in keyof T]: T[K] extends Color ? number : T[K] };
type BuiltInAttributes = 'objectId' | 'createdAt' | 'updatedAt';

type UserSignUpErrorType = 'username_taken' | 'unknown';
type UserSignInErrorType = 'invalid_username_or_password' | 'unknown';
type InvalidSessionTokenErrorType = 'invalid_session_token' | 'unknown';
type ErrorType = UserSignUpErrorType | UserSignInErrorType | InvalidSessionTokenErrorType;

type User = { objectId: string; sessionToken: string };
type QueryResult<T> = { results: InboundAttributes<T>[] };
type ParseObject = InboundAttributes<{ objectId: string; createdAt: string }>;
type ResolvedValue = User | QueryResult<CommentEntity> | ParseObject | void;

type Result<L, R> = Promise<
  R extends never
    ? L extends void
      ? { type: 'resolved'; value: L }
      : never // Error can be `never` only when the resolved value can be 'empty'.
    : { type: 'resolved'; value: L } | { type: 'rejected'; errorType: R }
>;

function getJsonPayload(payload: Payload): Record<string, unknown> | null {
  switch (payload.type) {
    case 'query': {
      const { order, limit } = payload;
      return {
        order: Object.entries(order)
          .map(([attribute, sign]) =>
            sign === undefined ? null : `${sign > 0 ? '' : '-'}${attribute}`
          )
          .filter(Boolean)
          .join(','),
        limit,
      };
    }
    case 'parse_object':
    case 'key_value': {
      const { data } = payload;
      return data;
    }
    case 'session_token':
      return null;
  }
}

function getSessionToken(payload: Payload): string | null {
  switch (payload.type) {
    case 'query':
    case 'session_token':
    case 'parse_object':
      return payload.sessionToken;
    case 'key_value':
      return null;
  }
}

export default fetchBackend;
