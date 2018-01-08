import {CommentEntity} from '../entitySystem/alias';
import CommentData from './CommentData';

interface CommentLoader {
  loadBatch(commentsData: CommentData[], boot?: boolean, blink?: boolean): CommentEntity[];

  load(commentData: CommentData, boot?: boolean, blink?: boolean): CommentEntity;

  unload(comment: CommentEntity): void;
}

export default CommentLoader;
