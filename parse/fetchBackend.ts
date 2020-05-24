import fetch from 'node-fetch';
import { URL } from 'url';
import devApplicationId from './config/dev/applicationId.json';
import devMasterKey from './config/dev/masterKey.json';
import devServerUrl from './config/dev/serverUrl.json';
import prodApplicationId from './config/prod/applicationId.json';
import prodMasterKey from './config/prod/masterKey.json';
import prodServerUrl from './config/prod/serverUrl.json';

async function fetchBackend(method: 'GET', path: string): Promise<any>;
async function fetchBackend(method: 'PUT', path: string, body: string): Promise<any>;
async function fetchBackend(method: string, path: string, body?: string) {
  const url = new URL(path, config.serverUrl);
  const response = await fetch(url.href, {
    method,
    headers: {
      'X-Parse-Application-Id': config.applicationId,
      'X-Parse-Master-Key': config.masterKey,
      'Content-Type': 'application/json',
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    console.error('Unexpected response status when fetching schema.', payload, response);
    throw new TypeError('Unexpected response status when fetching schema');
  }

  return payload;
}

const config = (() => {
  if (process.env.ENV === 'prod') {
    console.log('Configuring prod environment');
    return {
      applicationId: prodApplicationId,
      masterKey: prodMasterKey,
      serverUrl: prodServerUrl,
    };
  }
  if (process.env.ENV === 'dev') {
    console.log('Configuring dev environment');
    return {
      applicationId: devApplicationId,
      masterKey: devMasterKey,
      serverUrl: devServerUrl,
    };
  }
  throw new TypeError('Expected environment dev or prod');
})();

export default fetchBackend;
