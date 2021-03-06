import EntitySchema from '../schemas/Entity.json';
import fetchBackend from './internal/fetchBackend';

async function pushDatabaseSchema(className: string, schema: any) {
  const currentSchema = await fetchBackend('GET', getSchemaPath(className));
  // Remove already defined indices as Parse does not support updating indices.
  for (const indexName of Object.keys(currentSchema.indexes || {})) {
    if (!Object.prototype.hasOwnProperty.call(schema.indexes, indexName)) {
      continue;
    }
    console.warn('Not updating already defined index:', indexName, 'for class:', className);
    delete schema.indexes[indexName];
  }

  await fetchBackend('PUT', getSchemaPath(className), {
    type: 'json',
    serializedData: JSON.stringify(schema),
  });
}

function getSchemaPath(className: string): string {
  return `/schemas/${className}`;
}

async function configureBackend() {
  await pushDatabaseSchema('Entity', EntitySchema);
}

configureBackend();
