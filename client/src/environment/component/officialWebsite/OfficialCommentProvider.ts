import CommentProvider from '../../interface/CommentProvider';
import CommentData from '../../../comment/CommentData';
import ConfigProvider from '../../config/ConfigProvider';
import Provider from '../../../util/syntax/Provider';
import socketIOClient = require('socket.io-client');
import SailsIOJS = require('sails.io.js');

class OfficialCommentProvider implements CommentProvider {
  constructor(
      private io: SailsIOJS.Client = SailsIOJS(socketIOClient),
      readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal()) {
    io.sails.url = ConfigProvider.get().baseUrl;
  }

  connect(): void {
    let ignored = this.startToListen();
  }

  async getAllComments(): Promise<Provider<CommentData[]>> {
    // TODO
    throw new TypeError('Not implemented');
    // return new Promise<CommentData[]>((resolve, reject) => {
    //   this.io.socket.get(ConfigProvider.get().batchCommentsPath, (body: any, JWR: any) => {
    //
    //   });
    // });
  }

  private async startToListen() {
    while (true) {
      let commentData = await this.listenForComment();
      this.commentReceived.dispatch(commentData);
    }
  }

  private async listenForComment(): Promise<CommentData> {
    // TODO
    throw new TypeError('Not implemented');
    // return new Promise<CommentData>(resolve => {
    //   this.io.socket.get(ConfigProvider.get().newCommentBroadCastPath, (body: any, JWR: any) => {
    //   });
    // });
  }
}

export default OfficialCommentProvider;
