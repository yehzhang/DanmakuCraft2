import fetch from 'node-fetch';
import { URL } from 'url';
import applicationId from './config/applicationId.json';
import masterKey from './config/masterKey.json';
import serverUrl from './config/serverUrl.json';
import CommentSchema from './schema/Comment.json';

async function pushDatabaseSchema(className: string, schema: any) {
  const currentSchema = await fetchDatabaseSchema('GET', className);
  // Remove already defined indices as Parse does not support updating indices.
  for (const indexName of Object.keys(currentSchema.indexes)) {
    if (!Object.prototype.hasOwnProperty.call(schema.indexes, indexName)) {
      continue;
    }
    console.warn('Not updating already defined index:', indexName);
    delete schema.indexes[indexName];
  }

  const updatedSchema = await fetchDatabaseSchema('PUT', className, JSON.stringify(schema));
  console.log('Schema pushed for', className, updatedSchema);
}

function fetchDatabaseSchema(method: 'GET', className: string): Promise<any>;
function fetchDatabaseSchema(method: 'PUT', className: string, body: string): Promise<any>;
async function fetchDatabaseSchema(method: string, className: string, body?: string) {
  const url = new URL(`/schemas/${className}`, serverUrl);
  const response = await fetch(url.href, {
    method: 'PUT',
    headers: {
      'X-Parse-Application-Id': applicationId,
      'X-Parse-Master-Key': masterKey,
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

async function configureBackend() {
  await pushDatabaseSchema('Comment', CommentSchema);
}

configureBackend();
