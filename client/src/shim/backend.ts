import { FlatCommentDataResponse } from '../../../server/api/services/FlatCommentData';
import { CreationRequestData } from '../../../server/api/services/request';
import { port as devPort } from '../../../server/config/env/development';
import { frontend as frontendConfig } from '../../../server/config/frontend';

export function getBackendUrl(path: string): string {
  const url = new URL(backendBaseUrl);
  url.pathname = path;
  return url.href;
}

const backendBaseUrl = __LOCAL_BACKEND__ ? `http://localhost:${devPort}` : frontendConfig.baseUrl;

export async function getFromBackend(eventIdentity: 'comment'): Promise<CommentFoundData> {
  const response = await fetch(getBackendUrl(eventIdentity));
  return await parseResponse(response);
}

interface CommentFoundData {
  comments: FlatCommentDataResponse[];
}

export async function postToBackend(
  eventIdentity: 'comment',
  data: CreationRequestData
): Promise<CommentCreatedData> {
  const response = await fetch(getBackendUrl(eventIdentity), {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await parseResponse(response);
}

export interface CommentCreatedData {
  comment: FlatCommentDataResponse;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ResponseError('Unexpected unknown message', response);
  }
  const message = await response.json();
  if (message == null || typeof message !== 'object') {
    throw new ResponseError('Unexpected unknown message', response);
  }
  if (message.status === 'resolved') {
    return message.value;
  }
  if (message.status === 'rejected') {
    throw new ResponseError('Unexpected error response', response);
  }
  throw new ResponseError('Unexpected message status', response);
}

class ResponseError extends TypeError {
  constructor(message: string, response: Response) {
    super(`${message}. Response: ${response.text()}`);
    this.name = ResponseError.name;
  }
}
