import { mkdir, writeFile } from 'fs/promises';
import * as _ from 'lodash';
import { customAlphabet } from 'nanoid';
import path from 'path';
import commentDump from '../data/dump/comment.json';
import commentUserDump from '../data/dump/comment_user.json';
import externalUserDump from '../data/dump/external_user.json';

async function outputEntityTable() {
  const table = (commentDump as any).map(
    ({ id, text, color, size, coordinateX, coordinateY, chromatic }: any) => ({
      objectId: getObjectId(id),
      text,
      color: chromatic ? undefined : color,
      size,
      x: coordinateX,
      y: coordinateY,
      type: chromatic ? 'chromatic' : 'plain',
    })
  );
  await outputTable('Entity', table, 5);
}

async function outputBilibiliUserCommentTable() {
  const userIdToBilibiliUserId = new Map();
  for (const { correspondsTo, externalId } of externalUserDump as any) {
    if (userIdToBilibiliUserId.has(correspondsTo)) {
      throw new TypeError(
        `Unexpected multiple external users corresponding to the same user id: ${correspondsTo}`
      );
    }
    userIdToBilibiliUserId.set(correspondsTo, externalId);
  }

  const table = [];
  const defaultUserId = 1;
  for (const { user_id: userId, comment_id: commentId } of commentUserDump as any) {
    if (userId === defaultUserId) {
      // Do not migrate the default user -- just set `userId` to `null`.
      continue;
    }

    const bilibiliUserId = userIdToBilibiliUserId.get(userId);
    if (!bilibiliUserId) {
      continue;
    }

    table.push({
      bilibiliUserId,
      commentId: getObjectId(commentId),
    });
  }

  await outputTable('BilibiliUserComment', table);
}

const outputDirectory = '../build/database_import/';

async function outputTable(tableName: string, table: object[], partitions = 1) {
  const chunkSize = Math.ceil(table.length / partitions);
  await Promise.all(
    _.chunk(table, chunkSize).map((partition, partitionIndex) => {
      const outputPath = path.join(outputDirectory, `${tableName}_${partitionIndex}.json`);

      const printedRows = partition.map((row) => JSON.stringify(row)).join(',\n');
      const printedTable = `{"results": [\n${printedRows}\n]}\n`;

      return writeFile(outputPath, printedTable);
    })
  );
}

function getObjectId(commentId: number): string {
  const objectId = objectIdMapping.get(commentId);
  if (objectId) {
    return objectId;
  }

  const newObjectId = nanoid();
  objectIdMapping.set(commentId, newObjectId);

  return newObjectId;
}

const objectIdMapping = new Map<number, string>();
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([outputEntityTable(), outputBilibiliUserCommentTable()]);
}

main();
