import CommentData from '../../comment/CommentData';

interface CommentSender {
  send(commentData: CommentData): Promise<CommentSenderResponse>;
}

export default CommentSender;

export class CommentSenderResponse {
}
