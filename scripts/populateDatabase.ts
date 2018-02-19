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
  const data = await asPromise(readFile.bind(null, filename));
  const xmlData = await asPromise<any>(parseString.bind(null, data));
  const commentsErrors = new Map();
  const commentsData = xmlData.i.d
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
  const dateValue = new Date().toISOString();
  const initialUserValue = [['UNKNOWN', dateValue, dateValue]];
  const initialUserQuery = `INSERT INTO "user" ("shortId", "createdAt", "updatedAt") 
      VALUES ${formatValues(initialUserValue)};`;

  const userRelations = asSequence(commentsData)
      .map(data => data.userId)
      .distinct()
      .mapIndexed(
          (index, externalId) => new UserRelation(externalId, shortid.generate(), index + 2))
      .toArray();
  const userValues = userRelations.map(relation => [relation.userId, dateValue, dateValue]);
  const insertUsersQuery = ` INSERT INTO "user" ("shortId", "createdAt", "updatedAt") 
      VALUES ${formatValues(userValues)};`;

  const externalUserValues = userRelations.map(
      relation => ['bilibili', relation.userIndex, relation.externalId, dateValue, dateValue]);
  const insertExternalUsersQuery = `INSERT INTO externaluser (origin, "correspondsTo", "externalId", "createdAt", "updatedAt") 
      VALUES ${formatValues(externalUserValues)};`;

  const commentValues = commentsData.map(data => {
    const sentAt = moment(data.sentAt * 1000).tz('Asia/Shanghai').format();
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
  const insertCommentsQuery = `INSERT INTO comment (text, color, size, "coordinateX", "coordinateY", "buffType", "buffParameter", "createdAt", "updatedAt") 
      VALUES\n${formatValues(commentValues)};`;

  const externalUsersMapping = new Map(userRelations.map(
      relation => [relation.externalId, relation.userIndex] as [string, number]));
  const userCommentValues = commentsData.map(
      (data, commentIndex) => [externalUsersMapping.get(data.userId), commentIndex + 1]);
  const insertUserCommentsQuery = `INSERT INTO comment_comment_comment__user_comment (user_comment, comment_comment_comment) 
      VALUES\n${formatValues(userCommentValues)};`;

  return [
    initialUserQuery,
    insertUsersQuery,
    insertExternalUsersQuery,
    insertCommentsQuery,
    insertUserCommentsQuery].join('');
}

class UserRelation {
  constructor(readonly externalId: string, readonly userId: string, readonly userIndex: number) {
  }
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
  const path = process.argv[2];
  if (!path) {
    throw new TypeError('Invalid path');
  }

  let count = parseInt(process.argv[3], 10);
  if (!count) {
    count = Infinity;
  }

  const commentsData = await parse(path);
  const query = asQueries(commentsData.slice(0, count));
  console.log(query);
}

const ignored = main();
