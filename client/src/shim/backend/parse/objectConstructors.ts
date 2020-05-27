import { Object } from 'parse';
import { CommentEntity } from '../../../data/entity';
import BilibiliUserComment from '../BilibiliUserComment';

const createParseObjectConstructor: CreateParseObjectConstructor = (tableName: string) =>
  Object.extend(tableName);

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
