import checkExhaustive from '../checkExhaustive';
import logErrorMessage from '../logging/logErrorMessage';
import { applicationId, javaScriptKey, serverUrl } from './initializeBackend';

function fetchBackend(
  path: 'users',
  method: 'POST',
  payload: JsonPayload<{ username: string; email: string; password: string }>
): Promise<Resolved<User> | Rejected<UserSignUpErrorType>>;
async function fetchBackend(
  path: 'users',
  method: 'POST',
  payload: Payload
): Promise<Resolved<Response> | Rejected<ErrorType>> {
  const url = new URL(path, serverUrl);
  const response = await fetch(url.href, {
    method,
    headers: {
      'X-Parse-Application-Id': applicationId,
      'X-Parse-Javascript-Key': javaScriptKey,
      'Content-Type': 'application/json',
      ...(path === 'users'
        ? {
            'X-Parse-Revocable-Session': '1',
          }
        : null),
    },
    body: JSON.stringify(payload.data),
  });

  const responseJson = await response.json();
  if (typeof responseJson !== 'object' || responseJson.error) {
    return { type: 'rejected', errorType: getErrorType(responseJson.code, path) };
  }

  return { type: 'resolved', value: responseJson };
}

type JsonPayload<T> = { type: 'jsonBody'; data: T };
type Payload = JsonPayload<unknown>;

type UserSignUpErrorType = 'user_email_taken';
type ErrorType = UserSignUpErrorType | 'unknown';
type Rejected<T> = { type: 'rejected'; errorType: T | 'unknown' };

type User = { sessionToken: string };
type Response = User;
type Resolved<T> = { type: 'resolved'; value: T };

function getErrorType(errorCode: unknown, path: 'users'): ErrorType {
  if (path === 'users') {
    switch (errorCode) {
      case 203:
        return 'user_email_taken';
      default:
        logErrorMessage('Expected valid error code', { errorCode });
        return 'unknown';
    }
  }
  checkExhaustive(path);
}

export default fetchBackend;
