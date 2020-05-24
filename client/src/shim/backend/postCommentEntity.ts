import { toRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import { BilibiliUserCommentConstructor, CommentEntityConstructor } from './parse';

async function postCommentEntity(commentEntity: CommentEntity, bilibiliUserId?: string) {
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

  if (bilibiliUserId === undefined) {
    return;
  }
  const bilibiliUserComment = new BilibiliUserCommentConstructor();
  bilibiliUserComment.set('bilibiliUserId', bilibiliUserId);
  bilibiliUserComment.set('commentId', commentEntityObject.id);
  const ignored = bilibiliUserComment.save();
}

export default postCommentEntity;
