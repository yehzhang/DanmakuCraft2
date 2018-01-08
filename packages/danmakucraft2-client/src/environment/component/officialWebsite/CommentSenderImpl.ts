import CommentSender, {CommentSenderResponse} from '../../interface/CommentSender';
import CommentData from '../../../comment/CommentData';

class CommentSenderImpl implements CommentSender {
  async send(commentData: CommentData): Promise<CommentSenderResponse> {
    // TODO
     throw new TypeError('Not implemented');
  }
}

export default CommentSenderImpl;
