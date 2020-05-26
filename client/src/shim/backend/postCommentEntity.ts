import { toRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import {
  BilibiliUserCommentConstructor,
  CommentEntityConstructor,
  OutboundAttributes,
} from './objectConstructors';

/** Resolves to the id of the comment entity. */
async function postCommentEntity(
  commentEntity: OutboundAttributes<CommentEntity>,
  bilibiliUserId?: string
): Promise<[string, CommentEntity]> {
  const serializedCommentEntity =
    commentEntity.type === 'plain'
      ? {
          ...commentEntity,
          color: toRgbNumber(commentEntity.color),
        }
      : commentEntity;

  const commentEntityObject = new CommentEntityConstructor();
  commentEntityObject.set(serializedCommentEntity);
  await commentEntityObject.save();

  const { id, createdAt } = commentEntityObject;
  if (bilibiliUserId !== undefined) {
    postBilibiliUserComment(bilibiliUserId, id);
  }

  return [
    id,
    {
      ...commentEntity,
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
