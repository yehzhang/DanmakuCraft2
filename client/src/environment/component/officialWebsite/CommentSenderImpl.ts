import CommentSender from '../../interface/CommentSender';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import ConfigProvider from '../../config/ConfigProvider';
import Socket from './Socket';

class CommentSenderImpl implements CommentSender {
  constructor(private socket: Socket, private provider: CommentProvider) {
    let ignored = this.start();
  }

  async start() {
    for await (let commentData of this.provider.getNewComments()) {
      await this.send(commentData);
    }
  }

  async send(commentData: CommentData): Promise<void> {
    let response = await this.socket.post(ConfigProvider.get().commentsPath, commentData.flatten());

    if (response == null) {
      return;
    }

    response.apply();
  }
}

export default CommentSenderImpl;
