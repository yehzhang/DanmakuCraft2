import { readFileSync, writeFileSync } from 'fs';
import { parseFromFile } from './commentData';

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new TypeError('Invalid inputPath');
  }

  let count = Number(process.argv[3]);
  if (!count) {
    count = Infinity;
  }

  const outputPath = process.argv[4];
  if (!outputPath) {
    throw new TypeError('Invalid outputPath');
  }

  const nedbBuffer = readFileSync(outputPath);
  const nedb = JSON.parse(nedbBuffer.toString());
  const commentsData = await parseFromFile(inputPath);
  nedb.data.comment.push(...commentsData.slice(-count));

  const nedbString = JSON.stringify(nedb, undefined, 2);
  writeFileSync(outputPath, nedbString);
}

const ignored = main();
