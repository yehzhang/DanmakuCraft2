import Parse from 'parse';
import { CommentEntity } from '../../data/entity';

export function createParseObjectConstructor(
  tableName: 'CommentEntity'
): new () => OutboundParseObject<CommentEntity> {
  return Parse.Object.extend(tableName);
}

type OutboundParseObject<T extends Parse.Attributes> = Parse.Object<ExcludeBaseAttributes<T>>;
type ExcludeBaseAttributes<T extends Parse.Attributes> = {
  [P in keyof T]: P extends keyof Parse.BaseAttributes ? never : T[P];
};

export const ParseQueryConstructor: new <T extends Parse.Attributes>(
  ParseObjectConstructor: new () => OutboundParseObject<T>
) => ParseQuery<T> = Parse.Query;

interface ParseQuery<T extends Parse.Attributes> {
  descending(key: keyof T): this;
  limit(n: number): this;
  find(): Promise<InboundParseObject<T>[]>;
}

export type InboundParseObject<T extends Parse.Attributes> = OutboundParseObject<
  {
    [P in keyof UnionToIntersectionHack<T>]?: unknown;
  }
>;
type UnionToIntersectionHack<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
