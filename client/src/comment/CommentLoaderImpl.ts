import {asSequence} from 'sequency';
import {CommentEntity, UpdatingCommentEntity} from '../entitySystem/alias';
import RegisteredTimes from '../entitySystem/component/RegisteredTimes';
import UpdatingBuffCarrier from '../entitySystem/component/UpdatingBuffCarrier';
import EntityFactory from '../entitySystem/EntityFactory';
import {BuffData} from '../entitySystem/system/buff/BuffData';
import BuffDataApplier from '../entitySystem/system/buff/BuffDataApplier';
import EntityRegister from '../util/entityStorage/EntityRegister';
import CommentData from './CommentData';
import CommentLoader from './CommentLoader';

class CommentLoaderImpl implements CommentLoader {
  constructor(
      private game: Phaser.Game,
      private commentsRegister: EntityRegister<CommentEntity>,
      private updatingCommentsRegister: EntityRegister<UpdatingCommentEntity>,
      private entityFactory: EntityFactory,
      private buffDataApplier: BuffDataApplier) {
  }

  loadBatch(commentsData: Iterable<CommentData>, blink?: boolean): CommentEntity[] {
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
      this.commentsRegister.registerBatch(comments);
    }

    if (updatingComments.length > 0) {
      this.updatingCommentsRegister.registerBatch(updatingComments);
    }

    if (!blink) {
      asSequence([comments, updatingComments]).flatten()
          .forEach(comment => comment.registeredTimes = RegisteredTimes.MAX);
    }

    return comments;
  }

  load(commentData: CommentData, blink?: boolean): CommentEntity {
    let comment;
    if (commentData.buffData == null) {
      comment = this.entityFactory.createCommentEntity(commentData);
      this.commentsRegister.register(comment);
    } else {
      comment = this.createUpdatingCommentEntity(commentData, commentData.buffData);
      this.updatingCommentsRegister.register(comment);
    }

    if (!blink) {
      comment.registeredTimes = RegisteredTimes.MAX;
    }

    return comment;
  }

  unload(comment: CommentEntity) {
    let register;
    if (UpdatingBuffCarrier.isTypeOf(comment)) {
      register = this.updatingCommentsRegister;
    } else {
      register = this.commentsRegister;
    }

    register.deregister(comment);
  }

  private createUpdatingCommentEntity(commentData: CommentData, buffData: BuffData) {
    let comment = this.entityFactory.createUpdatingCommentEntity(commentData);
    this.buffDataApplier.activateOnComment(buffData, comment);
    return comment;
  }
}

export default CommentLoaderImpl;
