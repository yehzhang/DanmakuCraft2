import {CreationRequestData} from '../../../../../server/api/services/request';
import CommentData from '../../../comment/CommentData';
import Notifier from '../../../output/notification/Notifier';
import ConfigProvider from '../../config/ConfigProvider';
import CommentProvider from '../../interface/CommentProvider';
import CommentSender from '../../interface/CommentSender';
import EnvironmentVariables from '../bilibili/EnvironmentVariables';
import Jar from './Jar';
import Socket from './Socket';

class CommentSenderImpl implements CommentSender {
  constructor(
      private socket: Socket,
      private provider: CommentProvider,
      private nextCreationTokenJar: Jar,
      private notifier: Notifier) {
    const ignored = this.start();
  }

  async start() {
    for await (const commentData of this.provider.getNewComments()) {
      try {
        await this.send(commentData);
      } catch (e) {
        console.error('Error while sending a comment:', e);
        this.notifier.send(e.message);
      }
    }
  }

  async send(commentData: CommentData): Promise<void> {
    const creationRequestData: CreationRequestData = {
      comment: commentData.flatten(),
      user: {
        origin: 'bilibili',
        id: EnvironmentVariables.uid,
      },
      nextCreationToken: this.nextCreationTokenJar.get(),
    };
    const response = await this.socket.post(
        ConfigProvider.get().commentIdentity,
        creationRequestData);

    if (!response) {
      return;
    }
    response.apply();
  }
}

export default CommentSenderImpl;
