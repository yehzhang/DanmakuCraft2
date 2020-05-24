import { CommentEntity } from '../../data/entity';
import { BilibiliUserCommentConstructor, CommentEntityConstructor } from './parse';

async function postCommentEntity(commentEntity: CommentEntity, bilibiliUserId?: string) {
  const commentEntityObject = new CommentEntityConstructor();
  commentEntityObject.set(commentEntity);
  await commentEntityObject.save();

  if (bilibiliUserId === undefined) {
    return;
  }
  const bilibiliUserComment = new BilibiliUserCommentConstructor();
  bilibiliUserComment.set('bilibiliUserId', bilibiliUserId);
  bilibiliUserComment.set('commentId', commentEntityObject.id);
}

export default postCommentEntity;
