import mimetype from 'mime-types';
import { URL } from 'url';
import appConfig from './appConfig';
import buildCommand from './buildCommand';
import execute from './execute';

async function fetchBackend(method: 'GET', path: string, query?: Query): Promise<Response>;
async function fetchBackend(method: 'POST' | 'PUT', path: string, body: Body): Promise<Response>;
async function fetchBackend(method: string, path: string, payload?: Payload) {
  const url = new URL(path, appConfig.serverUrl);
  const { contentType, extraFlags } = payload
    ? getCurlFlags(payload)
    : {
        contentType: 'application/json',
        extraFlags: [],
      };
  const command = buildCommand([
    'curl',
    `-X ${method}`,
    `-H 'X-Parse-Application-Id: ${appConfig.applicationId}'`,
    `-H 'X-Parse-Master-Key: ${appConfig.masterKey}'`,
    contentType && `-H "Content-Type: ${contentType}"`,
    '--silent',
    ...extraFlags,
    url.href,
  ]);
  const stdout = await execute(command);

  const response = JSON.parse(stdout);
  if (typeof response !== 'object' || response.error) {
    throw new TypeError(`Expected valid response: ${stdout}`);
  }

  console.debug('Got response from path', path, response);

  return response;
}

type Payload = Query | Body;
export type Query = { type: 'query'; where: object };
export type Body = { type: 'json'; serializedData: string } | { type: 'file'; path: string };

export interface Response {
  [key: string]: any;
}

function getCurlFlags(payload: Payload): { contentType?: string; extraFlags: string[] } {
  switch (payload.type) {
    case 'json':
      return {
        contentType: 'application/json',
        extraFlags: [`-d '${payload.serializedData}'`],
      };
    case 'file': {
      const { path } = payload;
      const contentType = mimetype.lookup(path);
      if (contentType === false) {
        throw new TypeError(`Unexpected file extension for file: ${path}`);
      }
      return {
        contentType,
        extraFlags: [`--data-binary '@${path}'`],
      };
    }
    case 'query': {
      const { where } = payload;
      return {
        extraFlags: ['-G', `--data-urlencode 'where=${JSON.stringify(where)}'`],
      };
    }
  }
}

export default fetchBackend;
