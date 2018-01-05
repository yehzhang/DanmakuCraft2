import {CommentEntity, UpdatingCommentEntity} from '../entitySystem/alias';
import EntityFactory from '../entitySystem/EntityFactory';
import CommentData from './CommentData';
import EntityRegister from '../util/entityStorage/EntityRegister';
import BuffDataApplier from '../entitySystem/system/buff/BuffDataApplier';
import {BuffData} from '../entitySystem/system/buff/BuffFactory';
import {asSequence} from 'sequency';

class CommentLoader {
  constructor(
      private game: Phaser.Game,
      private commentsRegister: EntityRegister<CommentEntity>,
      private updatingCommentsRegister: EntityRegister<UpdatingCommentEntity>,
      private entityFactory: EntityFactory,
      private buffDataApplier: BuffDataApplier) {
  }

  loadBatch(commentsData: CommentData[], boot?: boolean): CommentEntity[] {
    let comments = [];
    let updatingComments = [];
    for (let commentData of commentsData) {
      if (commentData.buffData == null) {
        let comment = this.entityFactory.createCommentEntity(commentData);
        comments.push(comment);
      } else {
        let comment = this.createUpdatingCommentEntity(commentData, commentData.buffData);
        updatingComments.push(comment);
      }
    }

    if (comments.length > 0) {
      this.commentsRegister.registerBatch(comments, boot);
    }

    if (updatingComments.length > 0) {
      this.updatingCommentsRegister.registerBatch(updatingComments, boot);
    }

    if (!boot) {
      asSequence(comments).plus(updatingComments).forEach(comment => this.blink(comment));
    }

    return comments;
  }

  load(commentData: CommentData, boot?: boolean): CommentEntity {
    let comment;
    if (commentData.buffData == null) {
      comment = this.entityFactory.createCommentEntity(commentData);
      this.commentsRegister.register(comment, boot);
    } else {
      comment = this.createUpdatingCommentEntity(commentData, commentData.buffData);
      this.updatingCommentsRegister.register(comment, boot);
    }

    if (!boot) {
      this.blink(comment);
    }

    return comment;
  }

  private createUpdatingCommentEntity(commentData: CommentData, buffData: BuffData) {
    let comment = this.entityFactory.createUpdatingCommentEntity(commentData);
    this.buffDataApplier.activateOnComment(buffData, comment);
    return comment;
  }

  private blink(comment: CommentEntity) {
    // TODO
    // this.game.add.tween(comment).to({alpha: 0})
  }
}

export default CommentLoader;
