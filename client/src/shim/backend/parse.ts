import Parse from 'parse';
import { CommentEntity } from '../../data/entity';
import BilibiliUserComment from './BilibiliUserComment';
import Resource from './Resource';

const createParseObjectConstructor: CreateParseObjectConstructor = (tableName: string) =>
  Parse.Object.extend(tableName);

interface CreateParseObjectConstructor {
  (tableName: 'Entity'): new () => Parse.Object<CommentEntity>;
  (tableName: 'BilibiliUserComment'): new () => Parse.Object<BilibiliUserComment>;
  (tableName: 'Resource'): new () => Parse.Object<Resource>;
}

export const CommentEntityConstructor = createParseObjectConstructor('Entity');
export const BilibiliUserCommentConstructor = createParseObjectConstructor('BilibiliUserComment');
export const ResourceConstructor = createParseObjectConstructor('Resource');

export const ParseQueryConstructor: new <T extends Parse.Attributes>(
  ParseObjectConstructor: new () => Parse.Object<T>
) => ParseQuery<T> = Parse.Query;

interface ParseQuery<T extends Parse.Attributes> {
  descending(key: keyof T): this;
  limit(n: number): this;
  containedIn<K extends keyof T>(key: K, values: T[K][]): this;
  equalTo<K extends keyof T>(key: K, value: T[K]): this;
  find(): Promise<InboundParseObject<T>[]>;
}

export type InboundParseObject<T extends Parse.Attributes> = Parse.Object<
  {
    [P in keyof UnionToIntersectionHack<T>]?: unknown;
  }
>;
type UnionToIntersectionHack<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
