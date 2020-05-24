import Parse from 'parse';
import { CommentEntity } from '../../data/entity';
import BilibiliUserComment from './BilibiliUserComment';

const createParseObjectConstructor: CreateParseObjectConstructor = (tableName: string) =>
  Parse.Object.extend(tableName);

interface CreateParseObjectConstructor {
  (tableName: 'CommentEntity'): new () => Parse.Object<CommentEntity>;
  (tableName: 'BilibiliUserComment'): new () => Parse.Object<BilibiliUserComment>;
}

export const CommentEntityConstructor = createParseObjectConstructor('CommentEntity');
export const BilibiliUserCommentConstructor = createParseObjectConstructor('BilibiliUserComment');

export const ParseQueryConstructor: new <T extends Parse.Attributes>(
  ParseObjectConstructor: new () => Parse.Object<T>
) => ParseQuery<T> = Parse.Query;

interface ParseQuery<T extends Parse.Attributes> {
  descending(key: keyof T): this;
  limit(n: number): this;
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
