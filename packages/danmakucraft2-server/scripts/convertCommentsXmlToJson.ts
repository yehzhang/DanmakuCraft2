/// <reference path="../node_modules/@types/node/index.d.ts" />

import {readFile} from 'fs';
import {parseString} from 'xml2js';
import CommentDataUtil from './CommentDataUtil';

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

async function test(filename: string) {
  let data = await asPromise(readFile.bind(null, filename));
  let xmlData = await asPromise<any>(parseString.bind(null, data));
  return xmlData.i.map(
    (commentElement: any) => CommentDataUtil.parseFromXmlLine(commentElement.$, commentElement._));
}

test('./packages/danmakucraft2-server/assets/data/comments.dev.xml')
  .then(data => console.log('data', data))
  .catch(error => console.error('error', error));
