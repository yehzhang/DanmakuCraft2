import fetchBackend from './fetchBackend';
import BilibiliUserCommentSchema from './schema/BilibiliUserComment.json';
import EntitySchema from './schema/Entity.json';
import ResourceSchema from './schema/Resource.json';

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

  const updatedSchema = await fetchBackend('PUT', getSchemaPath(className), {
    type: 'json',
    serializedData: JSON.stringify(schema),
  });
  console.log('Schema pushed for', className, updatedSchema);
}

function getSchemaPath(className: string): string {
  return `/schemas/${className}`;
}

async function configureBackend() {
  await Promise.all([
    pushDatabaseSchema('Entity', EntitySchema),
    pushDatabaseSchema('BilibiliUserComment', BilibiliUserCommentSchema),
    pushDatabaseSchema('Resource', ResourceSchema),
  ]);
}

configureBackend();
