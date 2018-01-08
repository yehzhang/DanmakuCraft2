import CommentProvider from '../../interface/CommentProvider';
import CommentData from '../../../comment/CommentData';

class OfficialCommentProvider implements CommentProvider {
  constructor(readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal()) {
    // TODO commentReceived
  }

  connect(): void {
    throw new Error('Not implemented'); // TODO
  }

  async getAllComments(): Promise<CommentData[]> {
    return new Promise<CommentData[]>(resolve => {
      throw new Error('Not implemented'); // TODO
    });
  }
}

export default OfficialCommentProvider;
