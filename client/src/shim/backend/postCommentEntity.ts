import { toRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import logErrorMessage from '../logging/logErrorMessage';
import ParametricTypeError from '../logging/ParametricTypeError';
import fetchBackend, { OutboundAttributes } from './fetchBackend';
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
  if (result.type === 'rejected') {
    throw new ParametricTypeError('Unexpected error when posting comment entity', { result });
  }

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
    const ignored = postBilibiliUserComment(bilibiliUserId, objectId, sessionToken);
  }

  return [
    objectId,
    {
      ...outboundCommentEntity,
      createdAt,
    },
  ];
}

async function postBilibiliUserComment(
  bilibiliUserId: string,
  commentEntityId: string,
  sessionToken: string
) {
  const result = await fetchBackend('classes/BilibiliUserComment', 'POST', {
    type: 'parse_object',
    data: {
      bilibiliUserId,
      commentEntityId,
    },
    sessionToken,
  });
  if (result.type === 'rejected') {
    logErrorMessage('Expected Bilibili user comment posted', { result });
  }
}

export default postCommentEntity;
