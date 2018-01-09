import {readFile} from 'fs';
import {parseString} from 'xml2js';
import CommentDataUtil from './CommentDataUtil';
import CommentData from '../../client/src/comment/CommentData';

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
  return xmlData.i.d
    .map((commentElement: any) => {
      if (!commentElement._ || !commentElement.$) {
        return null;
      }
      try {
        return CommentDataUtil.parseFromXmlLine(commentElement.$.p, commentElement._);
      } catch (e) {
        console.error(e);
        return null;
      }
    })
    .filter(Boolean) as CommentData[];
}

test('./server/assets/data/comments.dev.xml')
  .then(data => console.log('data', data))
  .catch(error => console.error('error', error));
