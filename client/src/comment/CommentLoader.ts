import {CommentEntity} from '../entitySystem/alias';
import CommentData from './CommentData';
import CommentProvider from '../environment/interface/CommentProvider';

interface CommentLoader {
  loadBatch(commentsData: CommentData[], blink?: boolean): CommentEntity[];

  load(commentData: CommentData, blink?: boolean): CommentEntity;

  unload(comment: CommentEntity): void;

  loadProvider(commentProvider: CommentProvider): Promise<void>;
}

export default CommentLoader;
