import { toRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import ParametricTypeError from '../logging/ParametricTypeError';
import fetchBackend, { OutboundAttributes } from './fetchBackend';
import parseDateData from './parseDateData';

/** Resolves to the id of the comment entity. */
async function postCommentEntity(
  outboundCommentEntity: OutboundAttributes<CommentEntity>,
  sessionToken: string
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

  return [
    objectId,
    {
      ...outboundCommentEntity,
      createdAt,
    },
  ];
}

export default postCommentEntity;
