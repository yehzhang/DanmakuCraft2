import {readFile} from 'fs';
import {parseString} from 'xml2js';
import CommentDataUtil, {BilibiliCommentData} from './CommentDataUtil';
import {asSequence} from 'sequency';
// @ts-ignore
import escape = require('pg-escape');
import moment = require('moment-timezone');
import shortid = require('shortid');

async function asPromise<T>(
    callback: (callback: (err: any, data: T) => void) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    callback((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function parse(filename: string) {
  let data = await asPromise(readFile.bind(null, filename));
  let xmlData = await asPromise<any>(parseString.bind(null, data));
  let commentsErrors = new Map();
  let commentsData = xmlData.i.d
      .map((commentElement: any) => {
        if (!commentElement._ || !commentElement.$) {
          return null;
        }
        try {
          return CommentDataUtil.parseFromXmlLine(commentElement.$.p, commentElement._);
        } catch (e) {
          let commentsErrorCount = commentsErrors.get(e.message);
          if (commentsErrorCount === undefined) {
            commentsErrorCount = 1;
          } else {
            commentsErrorCount++;
          }
          commentsErrors.set(e.message, commentsErrorCount);

          return null;
        }
      })
      .filter(Boolean) as BilibiliCommentData[];

  console.error(commentsErrors);

  return commentsData;
}

function asQueries(commentsData: BilibiliCommentData[]): string {
  let dateValue = new Date().toISOString();
  let initialUserValue = [['UNKNOWN', dateValue, dateValue]];
  let initialUserQuery = `INSERT INTO "user" ("shortId", "createdAt", "updatedAt") 
      VALUES ${formatValues(initialUserValue)};`;

  let externalUsersRelations = asSequence(commentsData)
      .map(data => data.userId)
      .distinct()
      .map(userId => [userId, shortid.generate()] as [string, string])
      .toArray();
  let userValues = asSequence(externalUsersRelations)
      .map(([shortId]) => [shortId, dateValue, dateValue])
      .toArray();
  let insertUsersQuery = ` INSERT INTO "user" ("shortId", "createdAt", "updatedAt") 
      VALUES ${formatValues(userValues)};`;

  let externalUserValues = asSequence(externalUsersRelations)
      .mapIndexed((userIndex, [userId]) => ['bilibili', userIndex, userId, dateValue, dateValue])
      .toArray();
  let insertExternalUsersQuery = `INSERT INTO externaluser (origin, "correspondsTo", "externalId", "createdAt", "updatedAt") 
      VALUES ${formatValues(externalUserValues)};`;

  let commentValues = commentsData.map(data => {
    let sentAt = moment(data.sentAt * 1000).tz('Asia/Shanghai').format();
    return [
      data.text,
      data.color,
      data.size,
      data.coordinateX,
      data.coordinateY,
      data.buffType,
      data.buffParameter,
      sentAt,
      sentAt];
  });
  let insertCommentsQuery = `INSERT INTO comment (text, color, size, "coordinateX", "coordinateY", "buffType", "buffParameter", "createdAt", "updatedAt") 
      VALUES\n${formatValues(commentValues)};`;

  let externalUsersMapping = new Map(externalUsersRelations.map(
      ([userId], userIndex) => [userId, userIndex] as [string, number]));
  let userCommentValues = commentsData.map(
      (data, commentIndex) => [externalUsersMapping.get(data.userId), commentIndex]);
  let insertUserCommentsQuery = `INSERT INTO comment_comment_comment__user_comment (user_comment, comment_comment_comment) 
      VALUES\n${formatValues(userCommentValues)};`;

  return [
    initialUserQuery,
    insertUsersQuery,
    insertExternalUsersQuery,
    insertCommentsQuery,
    insertUserCommentsQuery].join('');
}

export function formatValues(rows: any[][]) {
  return rows.map(row => row.map(field => {
    if (typeof field === 'string' || field == null) {
      return escape.literal(field);
    }
    return field;
  })
      .join(', '))
      .map(tuple => `(${tuple})`)
      .join(',\n');
}

async function main() {
  let path = process.argv[2];
  if (!path) {
    throw new TypeError('Invalid path');
  }

  let count = parseInt(process.argv[3], 10);
  if (!count) {
    count = Infinity;
  }

  let commentsData = await parse(path);
  commentsData = commentsData.slice(0, count);
  let query = asQueries(commentsData);
  console.log(query);
}

let ignored = main();
