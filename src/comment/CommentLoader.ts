import {CommentEntity, UpdatingCommentEntity} from '../entitySystem/alias';
import EntityFactory from '../entitySystem/EntityFactory';
import CommentData from './CommentData';
import EntityRegister from '../util/entityStorage/EntityRegister';

class CommentLoader {
  constructor(
      private commentsRegister: EntityRegister<CommentEntity>,
      private updatingCommentsRegister: EntityRegister<UpdatingCommentEntity>,
      private entityFactory: EntityFactory) {
  }

  loadBatch(commentsData: CommentData[]): CommentEntity[] {
    let comments = [];
    let updatingComments = [];
    for (let commentData of commentsData) {
      if (commentData.buffData == null) {
        let comment = this.entityFactory.createCommentEntity(commentData);
        comments.push(comment);
      } else {
        let comment =
            this.entityFactory.createUpdatingCommentEntity(commentData, commentData.buffData);
        updatingComments.push(comment);
      }
    }

    if (comments.length > 0) {
      this.commentsRegister.registerBatch(comments);
    }
    if (updatingComments.length > 0) {
      this.updatingCommentsRegister.registerBatch(updatingComments);
    }

    return comments;
  }

  load(commentData: CommentData): CommentEntity {
    let comment;
    if (commentData.buffData == null) {
      comment = this.entityFactory.createCommentEntity(commentData);
      this.commentsRegister.register(comment);
    } else {
      comment = this.entityFactory.createUpdatingCommentEntity(commentData, commentData.buffData);
      this.updatingCommentsRegister.register(comment);
    }

    return comment;
  }
}

export default CommentLoader;
