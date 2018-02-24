import CommentSender from '../../interface/CommentSender';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import ConfigProvider from '../../config/ConfigProvider';
import Socket from './Socket';
import {CreationRequestData} from '../../../../../server/api/services/request';
import Jar from './Jar';
import EnvironmentVariables from '../bilibili/EnvironmentVariables';
import Notifier from '../../../output/notification/Notifier';

class CommentSenderImpl implements CommentSender {
  constructor(
      private socket: Socket,
      private provider: CommentProvider,
      private nextCreationTokenJar: Jar,
      private notifier: Notifier) {
    let ignored = this.start();
  }

  async start() {
    for await (let commentData of this.provider.getNewComments()) {
      try {
        await this.send(commentData);
      } catch (e) {
        console.error('Error while sending a comment:', e);
        this.notifier.send(e.message);
      }
    }
  }

  async send(commentData: CommentData): Promise<void> {
    let creationRequestData: CreationRequestData = {
      comment: commentData.flatten(),
      user: {
        origin: 'bilibili',
        id: EnvironmentVariables.uid,
      },
      nextCreationToken: this.nextCreationTokenJar.get(),
    };
    let response = await this.socket.post(ConfigProvider.get().commentIdentity, creationRequestData);

    if (response == null) {
      return;
    }

    response.apply();
  }
}

export default CommentSenderImpl;
