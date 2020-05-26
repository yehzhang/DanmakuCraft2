import Parse from 'parse';
import { CommentEntity } from '../../data/entity';
import BilibiliUserComment from './BilibiliUserComment';

const createParseObjectConstructor: CreateParseObjectConstructor = (tableName: string) =>
  Parse.Object.extend(tableName);

interface CreateParseObjectConstructor {
  (tableName: 'Entity'): new () => Parse.Object<OutboundAttributes<CommentEntity>>;
  (tableName: 'BilibiliUserComment'): new () => Parse.Object<
    OutboundAttributes<BilibiliUserComment>
  >;
}
export type OutboundAttributes<T extends Parse.Attributes> = T extends unknown
  ? Omit<T, keyof Parse.BaseAttributes>
  : never;

export const CommentEntityConstructor = createParseObjectConstructor('Entity');
export const BilibiliUserCommentConstructor = createParseObjectConstructor('BilibiliUserComment');

export const ParseQueryConstructor: new <T extends Parse.Attributes>(
  ParseObjectConstructor: new () => Parse.Object<T>
) => ParseQuery<T> = Parse.Query;

interface ParseQuery<T extends Parse.Attributes> {
  descending(key: keyof (T & Parse.BaseAttributes)): this;
  limit(n: number): this;
  containedIn<K extends keyof T>(key: K, values: T[K][]): this;
  equalTo<K extends keyof T>(key: K, value: T[K]): this;
  find(): Promise<Parse.Object<InboundAttributes<T>>[]>;
}

export type InboundAttributes<T extends Parse.Attributes> = {
  [P in keyof UnionToIntersectionHack<T>]?: unknown;
};
type UnionToIntersectionHack<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
