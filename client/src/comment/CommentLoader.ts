import {CommentEntity} from '../entitySystem/alias';
import CommentData from './CommentData';

interface CommentLoader {
  loadBatch(commentsData: Iterable<CommentData>, blink?: boolean): CommentEntity[];

  load(commentData: CommentData, blink?: boolean): CommentEntity;

  unload(comment: CommentEntity): void;
}

export default CommentLoader;
