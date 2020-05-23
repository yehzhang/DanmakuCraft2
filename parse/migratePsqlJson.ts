import { writeFile } from 'fs';
import path from 'path';
import { promisify } from 'util';
import commentDump from '../data/dump/comment.json';
import commentUserDump from '../data/dump/comment_user.json';
import externalUserDump from '../data/dump/external_user.json';
import userDump from '../data/dump/user.json';

async function outputCommentTable() {
  const commentIdToUserId = new Map();
  for (const { user_id: userId, comment_id: commentId } of commentUserDump as any) {
    if (commentIdToUserId.has(commentId)) {
      throw new TypeError(`Unexpected duplicate comment id: ${commentId}`);
    }
    if (userId === defaultUserId) {
      // Do not migrate the default user -- just set `userId` to `null`.
      continue;
    }
    commentIdToUserId.set(commentId, userId);
  }

  const commentTable = {
    results: (commentDump as any).map(
      ({ id, text, color, size, createdAt, coordinateX: x, coordinateY: y, chromatic }: any) => ({
        text,
        color,
        size,
        createdAt,
        x,
        y,
        chromatic,
        userId: commentIdToUserId.get(id),
      })
    ),
  };

  const outputPath = path.join(outputDirectory, 'Comment.json');
  await promisify(writeFile)(outputPath, JSON.stringify(commentTable));
}

async function outputUserTable() {
  const additionalUserData = new Map();
  for (const { origin, correspondsTo, externalId } of externalUserDump as any) {
    if (additionalUserData.has(correspondsTo)) {
      throw new TypeError(
        `Unexpected multiple external users corresponding to the same user id: ${correspondsTo}`
      );
    }
    additionalUserData.set(correspondsTo, {
      originDomain: origin,
      externalId,
    });
  }

  const userTable = {
    results: (userDump as any)
      // Do not migrate the default user -- just set `user` to `null`.
      .filter(({ id }: any) => id !== defaultUserId)
      .map(({ id, createdAt }: any) => ({
        objectId: id,
        createdAt,
        ...additionalUserData.get(id),
      })),
  };

  const outputPath = path.join(outputDirectory, 'User.json');
  await promisify(writeFile)(outputPath, JSON.stringify(userTable));
}

const defaultUserId = 1;

const outputDirectory = '../build/database_import/';

async function main() {
  await Promise.all([outputUserTable(), outputCommentTable()]);
}

main();
