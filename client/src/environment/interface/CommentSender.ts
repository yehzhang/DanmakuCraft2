import CommentData from '../../comment/CommentData';

interface CommentSender {
  send(commentData: CommentData): Promise<void>;
}

export default CommentSender;
