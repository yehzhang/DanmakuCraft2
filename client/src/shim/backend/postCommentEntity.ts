import { toRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import ParametricTypeError from '../logging/ParametricTypeError';
import fetchBackend from './fetchBackend';
import { BilibiliUserCommentConstructor, OutboundAttributes } from './parse/objectConstructors';
import parseDateData from './parseDateData';

/** Resolves to the id of the comment entity. */
async function postCommentEntity(
  outboundCommentEntity: OutboundAttributes<CommentEntity>,
  sessionToken: string,
  bilibiliUserId?: string
): Promise<[string, CommentEntity]> {
  const result = await fetchBackend('classes/Entity', 'POST', {
    type: 'parse_object',
    data:
      outboundCommentEntity.type === 'plain'
        ? {
            ...outboundCommentEntity,
            color: toRgbNumber(outboundCommentEntity.color),
          }
        : outboundCommentEntity,
    sessionToken,
  });

  const {
    value: { objectId, createdAt: rawCreatedAt },
  } = result;
  if (typeof objectId !== 'string') {
    throw new ParametricTypeError('Expected valid objectId in posted comment entity', { result });
  }
  const createdAt = parseDateData(rawCreatedAt);
  if (!createdAt) {
    throw new ParametricTypeError('Expected valid createdAt in posted comment entity', { result });
  }

  if (bilibiliUserId !== undefined) {
    postBilibiliUserComment(bilibiliUserId, objectId);
  }

  return [
    objectId,
    {
      ...outboundCommentEntity,
      createdAt,
    },
  ];
}

function postBilibiliUserComment(bilibiliUserId: string, commentEntityObjectId: string) {
  const bilibiliUserComment = new BilibiliUserCommentConstructor();
  bilibiliUserComment.set('bilibiliUserId', bilibiliUserId);
  bilibiliUserComment.set('commentEntityId', commentEntityObjectId);
  const ignored = bilibiliUserComment.save();
}

export default postCommentEntity;
