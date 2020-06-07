import checkExhaustive from '../checkExhaustive';
import logErrorMessage from '../logging/logErrorMessage';
import { applicationId, javaScriptKey, serverUrl } from './initializeBackend';

function fetchBackend(
  path: 'users',
  method: 'POST',
  payload: JsonPayload<{ username: string; email: string | undefined; password: string }>
): Promise<Resolved<User> | Rejected<UserSignUpErrorType>>;
function fetchBackend(
  path: 'users/me',
  method: 'GET',
  payload: SessionTokenPayload
): Promise<Resolved<void> | Rejected<InvalidSessionTokenErrorType>>;
async function fetchBackend(
  path: Path,
  method: string,
  payload: Payload
): Promise<Resolved<Response> | Rejected<ErrorType>> {
  const url = new URL(path, serverUrl);
  const response = await fetch(url.href, {
    method,
    headers: {
      'X-Parse-Application-Id': applicationId,
      'X-Parse-Javascript-Key': javaScriptKey,
      ...(path === 'users'
        ? {
            'Content-Type': 'application/json',
            'X-Parse-Revocable-Session': '1',
          }
        : null),
      ...(payload.type === 'sessionToken'
        ? {
            'X-Parse-Session-Token': payload.sessionToken,
          }
        : null),
    },
    body: payload.type === 'jsonBody' ? JSON.stringify(payload.data) : null,
  });

  const responseJson = await response.json();
  if (typeof responseJson !== 'object' || responseJson.error) {
    return { type: 'rejected', errorType: getErrorType(responseJson.code, path) };
  }

  return { type: 'resolved', value: responseJson };
}

type JsonPayload<T> = { type: 'jsonBody'; data: T };
type SessionTokenPayload = { type: 'sessionToken'; sessionToken: string };
type Payload = JsonPayload<unknown> | SessionTokenPayload;

type UserSignUpErrorType = 'user_email_taken' | 'username_taken';
type InvalidSessionTokenErrorType = 'invalid_session_token';
type ErrorType = UserSignUpErrorType | InvalidSessionTokenErrorType | 'unknown';
type Rejected<T> = { type: 'rejected'; errorType: T | 'unknown' };

type User = { sessionToken: string };
type Response = User | void;
type Resolved<T> = { type: 'resolved'; value: T };

type Path = 'users' | 'users/me';

function getErrorType(errorCode: unknown, path: Path): ErrorType {
  if (path === 'users') {
    if (errorCode === 202) {
      return 'username_taken';
    }
    if (errorCode === 203) {
      return 'user_email_taken';
    }
  } else if (path === 'users/me') {
    if (errorCode === 209) {
      return 'invalid_session_token';
    }
  } else {
    checkExhaustive(path);
    return 'unknown';
  }
  logErrorMessage('Expected valid error code', { path, errorCode });
  return 'unknown';
}

export default fetchBackend;
