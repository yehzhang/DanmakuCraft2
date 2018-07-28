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
      private readonly game: Phaser.Game,
      private readonly commentsRegister: EntityRegister<CommentEntity>,
      private readonly updatingCommentsRegister: EntityRegister<UpdatingCommentEntity>,
      private readonly entityFactory: EntityFactory,
      private readonly buffDataApplier: BuffDataApplier) {
  }

  loadBatch(commentsData: Iterable<CommentData>, blink?: boolean): CommentEntity[] {
    const comments = [];
    const updatingComments = [];
    for (const commentData of commentsData) {
      if (commentData.buffData == null) {
        const comment = this.entityFactory.createCommentEntity(commentData);
        comments.push(comment);
      } else {
        const comment = this.createUpdatingCommentEntity(commentData, commentData.buffData);
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
    const comment = this.entityFactory.createUpdatingCommentEntity(commentData);
    this.buffDataApplier.activateOnComment(buffData, comment);
    return comment;
  }
}

export default CommentLoaderImpl;
