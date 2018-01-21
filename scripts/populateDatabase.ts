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
  return xmlData.i.d
      .map((commentElement: any) => {
        if (!commentElement._ || !commentElement.$) {
          return null;
        }
        try {
          return CommentDataUtil.parseFromXmlLine(commentElement.$.p, commentElement._);
        } catch (e) {
          console.error(commentElement, e.message);
          return null;
        }
      })
      .filter(Boolean) as BilibiliCommentData[];
}

function asQueries(commentsData: BilibiliCommentData[]): string {
  let externalUsersMapping = asSequence(commentsData)
      .map(data => [data.userId, shortid.generate()] as [string, string])
      .toMap();
  let dateValue = new Date().toISOString();
  let userValues = asSequence(externalUsersMapping.values())
      .map(id => [id, dateValue, dateValue])
      .toArray();
  let insertUsersQuery = `
      INSERT INTO "user" ("id", "createdAt", "updatedAt") 
      VALUES ${formatValues(userValues)};`;

  let externalUserValues = asSequence(externalUsersMapping.keys()).map(
      userId => ['bilibili', externalUsersMapping.get(userId), userId, dateValue, dateValue])
      .toArray();
  let insertExternalUsersQuery = `
      INSERT INTO externaluser (origin, "correspondsTo", "externalId", "createdAt", "updatedAt") 
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
      externalUsersMapping.get(data.userId),
      sentAt,
      sentAt];
  });
  let insertCommentsQuery = `
      INSERT INTO comment (text, color, size, "coordinateX", "coordinateY", "buffType", "buffParameter", "user", "createdAt", "updatedAt") 
      VALUES\n${formatValues(commentValues)};`;

  return [insertUsersQuery, insertExternalUsersQuery, insertCommentsQuery].join('');
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
