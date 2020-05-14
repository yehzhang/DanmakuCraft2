import moment from 'moment-timezone';
import escape from 'pg-escape';
import { BilibiliCommentData, parseFromFile } from './commentData';
import { getExternalUser, getUserRelations } from './userRelation';

function asQueries(commentsData: BilibiliCommentData[]): string {
  const dateValue = new Date().toISOString();
  const initialUserValue = [['UNKNOWN', dateValue, dateValue]];
  const initialUserQuery = `INSERT INTO "user" ("shortId", "createdAt", "updatedAt") 
      VALUES ${formatValues(initialUserValue)};`;

  const userRelations = getUserRelations(commentsData);
  const userValues = userRelations.map((relation) => [relation.userId, dateValue, dateValue]);
  const insertUsersQuery = ` INSERT INTO "user" ("shortId", "createdAt", "updatedAt") 
      VALUES ${formatValues(userValues)};`;

  const externalUserValues = userRelations
    .map(getExternalUser)
    .map((relation) => [
      'bilibili',
      relation.correspondsTo,
      relation.externalId,
      dateValue,
      dateValue,
    ]);
  const insertExternalUsersQuery = `INSERT INTO externaluser (origin, "correspondsTo", "externalId", "createdAt", "updatedAt") 
      VALUES ${formatValues(externalUserValues)};`;

  const commentValues = commentsData.map((data) => {
    const sentAt = moment(data.sentAt * 1000)
      .tz('Asia/Shanghai')
      .format();
    return [
      data.text,
      data.color,
      data.size,
      data.coordinateX,
      data.coordinateY,
      data.buffType,
      data.buffParameter,
      sentAt,
      sentAt,
    ];
  });
  const insertCommentsQuery = `INSERT INTO comment (text, color, size, "coordinateX", "coordinateY", "buffType", "buffParameter", "createdAt", "updatedAt") 
      VALUES\n${formatValues(commentValues)};`;

  const externalUsersMapping = new Map(
    userRelations.map((relation) => [relation.externalId, relation.userIndex] as [string, number])
  );
  const userCommentValues = commentsData.map((data, commentIndex) => [
    externalUsersMapping.get(data.userId),
    commentIndex + 1,
  ]);
  const insertUserCommentsQuery = `INSERT INTO comment_comment_comment__user_comment (user_comment, comment_comment_comment) 
      VALUES\n${formatValues(userCommentValues)};`;

  return [
    initialUserQuery,
    insertUsersQuery,
    insertExternalUsersQuery,
    insertCommentsQuery,
    insertUserCommentsQuery,
  ].join('');
}

function formatValues(rows: any[][]) {
  return rows
    .map((row) =>
      row
        .map((field) => {
          if (typeof field === 'string' || field == null) {
            return escape.literal(field);
          }
          return field;
        })
        .join(', ')
    )
    .map((tuple) => `(${tuple})`)
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

  const commentsData = await parseFromFile(path);
  const query = asQueries(commentsData.slice(-count));
  console.log(query);
}

const ignored = main();
