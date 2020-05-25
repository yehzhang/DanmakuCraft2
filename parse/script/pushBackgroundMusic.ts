import { readdir } from 'fs/promises';
import { basename, join } from 'path';
import buildCommand from './internal/buildCommand';
import execute from './internal/execute';
import fetchBackend, { Body, Response } from './internal/fetchBackend';

async function pushResource(path: string) {
  const filename = basename(path);
  const { url } = await fetchBackend('POST', `files/${filename}`, {
    type: 'file',
    path,
  });

  const { results } = await fetchBackend('GET', `classes/Resource`, {
    type: 'query',
    where: {
      filename,
    },
  });

  if (results.length >= 2) {
    console.error('Unexpected duplicate filename', results);
    process.exit(1);
  }

  await createOrUpdateResourceObject(results[0]?.objectId, { filename, url });
}

async function createOrUpdateResourceObject(
  objectId: string | undefined,
  data: object
): Promise<Response> {
  const path = 'classes/Resource';
  const body: Body = {
    type: 'json',
    serializedData: JSON.stringify(data),
  };
  if (!objectId) {
    return fetchBackend('POST', path, body);
  }
  return fetchBackend('PUT', join(path, objectId), body);
}

async function pushBackgroundMusic() {
  const dataDirectory = '../data/audio';
  const outputDirectory = '../build/audio/';
  const command = buildCommand([
    'node',
    'node_modules/audiosprite/cli.js',
    '-b 192',
    '-v 6',
    '-f howler',
    '--export=ogg,m4a,mp3',
    `-o ${outputDirectory}/background_music`,
    `${dataDirectory}/background/*`,
    `&& mv ${outputDirectory}/background_music.json ${dataDirectory}`,
  ]);
  console.log(await execute(command));

  const filenames = await readdir(outputDirectory);
  await Promise.all(filenames.map((filename) => pushResource(join(outputDirectory, filename))));
}

pushBackgroundMusic();
