import CommentProvider from '../../interface/CommentProvider';
import CommentData from '../../../comment/CommentData';

class OfficialCommentProvider extends CommentProvider {
  constructor() {
    super();
  }

  connect(): void {
    throw new Error('Not implemented'); // TODO
  }

  async getAllComments() {
    return new Promise<CommentData[]>(resolve => {
      throw new Error('Not implemented'); // TODO
    });
  }
}

export default OfficialCommentProvider;
