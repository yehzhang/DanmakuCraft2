import {CommentEntity} from '../entitySystem/alias';
import CommentData from './CommentData';

interface CommentLoader {
  loadBatch(commentsData: CommentData[]): CommentEntity[];

  load(commentData: CommentData): CommentEntity;

  unload(comment: CommentEntity): void;
}

export default CommentLoader;
