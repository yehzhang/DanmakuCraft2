import CommentProvider from '../environment/interface/CommentProvider';
import {CommentEntity} from '../entitySystem/alias';
import EntityFactory from '../entitySystem/EntityFactory';
import CommentData from './CommentData';
import EntityRegister from '../util/entityStorage/EntityRegister';

class CommentLoader {
  constructor(
      private entityRegister: EntityRegister<CommentEntity>, private entityFactory: EntityFactory) {
  }

  loadBatch(commentsData: CommentData[]) {
    let comments = commentsData.map(this.entityFactory.createCommentEntity, this.entityFactory);
    this.entityRegister.registerBatch(comments);
    return comments;
  }

  load(commentData: CommentData) {
    let comment = this.entityFactory.createCommentEntity(commentData);
    this.entityRegister.register(comment);
    return comment;
  }

  listenTo(commentProvider: CommentProvider) {
    commentProvider.commentReceived.add(this.load, this);
  }
}

export default CommentLoader;
