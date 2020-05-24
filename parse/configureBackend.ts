import fetch from 'node-fetch';
import { URL } from 'url';
import devApplicationId from './config/dev/applicationId.json';
import devMasterKey from './config/dev/masterKey.json';
import devServerUrl from './config/dev/serverUrl.json';
import prodApplicationId from './config/prod/applicationId.json';
import prodMasterKey from './config/prod/masterKey.json';
import prodServerUrl from './config/prod/serverUrl.json';
import BilibiliUserCommentSchema from './schema/BilibiliUserComment.json';
import EntitySchema from './schema/Entity.json';

async function pushDatabaseSchema(className: string, schema: any) {
  const currentSchema = await fetchDatabaseSchema('GET', className);
  // Remove already defined indices as Parse does not support updating indices.
  for (const indexName of Object.keys(currentSchema.indexes || {})) {
    if (!Object.prototype.hasOwnProperty.call(schema.indexes, indexName)) {
      continue;
    }
    console.warn('Not updating already defined index:', indexName, 'for class:', className);
    delete schema.indexes[indexName];
  }

  const updatedSchema = await fetchDatabaseSchema('PUT', className, JSON.stringify(schema));
  console.log('Schema pushed for', className, updatedSchema);
}

function fetchDatabaseSchema(method: 'GET', className: string): Promise<any>;
function fetchDatabaseSchema(method: 'PUT', className: string, body: string): Promise<any>;
async function fetchDatabaseSchema(method: string, className: string, body?: string) {
  const url = new URL(`/schemas/${className}`, config.serverUrl);
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

let config: {
  readonly applicationId: string;
  readonly masterKey: string;
  readonly serverUrl: string;
};

async function configureBackend() {
  const environment = process.argv[2];
  if (environment === 'prod') {
    console.log('Configuring prod environment');
    config = {
      applicationId: prodApplicationId,
      masterKey: prodMasterKey,
      serverUrl: prodServerUrl,
    };
  } else if (environment === 'dev') {
    console.log('Configuring dev environment');
    config = {
      applicationId: devApplicationId,
      masterKey: devMasterKey,
      serverUrl: devServerUrl,
    };
  } else {
    throw new TypeError('Expected environment dev or prod');
  }

  await Promise.all([
    pushDatabaseSchema('Entity', EntitySchema),
    pushDatabaseSchema('BilibiliUserComment', BilibiliUserCommentSchema),
  ]);
}

configureBackend();
