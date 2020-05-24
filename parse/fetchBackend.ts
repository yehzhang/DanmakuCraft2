import childProcess from 'child_process';
import { lookup } from 'mime-types';
import { URL } from 'url';
import { promisify } from 'util';
import config from './config';

async function fetchBackend(method: 'GET', path: string): Promise<Response>;
async function fetchBackend(method: 'PUT', path: string, body: Body): Promise<Response>;
async function fetchBackend(method: string, path: string, body?: Body) {
  const url = new URL(path, config.serverUrl);
  const { contentType, extraFlags } = body
    ? getContentTypeAndFlags(body)
    : {
        contentType: 'application/json',
        extraFlags: [],
      };
  const command = `
    curl -X ${method} \
      -H "X-Parse-Application-Id: ${config.applicationId}" \
      -H "X-Parse-Master-Key: ${config.masterKey}" \
      -H "Content-Type: ${contentType}" \
      ${extraFlags.join(' ')} \
      ${url.href}`;

  console.log('Running command:', command);
  const { stdout, stderr } = await exec(command);
  if (stderr) {
    console.error(stderr);
  }

  const response = JSON.parse(stdout);
  if (typeof response !== 'object' || response.error) {
    throw new TypeError(`Expected valid response: ${stdout}`);
  }

  return response;
}

type Body = { type: 'json'; serializedData: string } | { type: 'file'; path: string };

interface Response {
  [key: string]: any;
}

function getContentTypeAndFlags(body: Body): { contentType: string; extraFlags: string[] } {
  switch (body.type) {
    case 'json':
      return {
        contentType: 'application/json',
        extraFlags: [`-d '${body.serializedData}'`],
      };
    case 'file': {
      const contentType = lookup(body.path);
      if (contentType === false) {
        throw new TypeError(`Unexpected file extension for file: ${body.path}`);
      }
      return {
        contentType,
        extraFlags: [`--data-binary '@${body.path}'`],
      };
    }
  }
}

const exec = promisify(childProcess.exec);

export default fetchBackend;
