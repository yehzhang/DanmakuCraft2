import CommentProvider from '../../interface/CommentProvider';
import CommentData, {FlatCommentData} from '../../../comment/CommentData';
import ConfigProvider from '../../config/ConfigProvider';
import Point from '../../../util/syntax/Point';
import {BuffData} from '../../../entitySystem/system/buff/BuffData';
import Queue from '../../../util/async/Queue';
import Socket from './Socket';
import Response from './Response';
import {asSequence} from 'sequency';

class OfficialCommentProvider implements CommentProvider {
  constructor(
      private socket: Socket,
      private responseQueue: Queue<Response<FlatCommentData>> = new Queue()) {
  }

  private static createCommentDataFrom(flatData: FlatCommentData) {
    let buffData;
    if (flatData.buffType) {
      buffData = new BuffData(flatData.buffType, flatData.buffParameter);
    } else {
      buffData = null;
    }

    return new CommentData(
        flatData.size,
        flatData.color,
        flatData.text,
        Point.of(flatData.coordinateX, flatData.coordinateY),
        buffData);
  }

  connect() {
    this.socket.on<FlatCommentData>(ConfigProvider.get().commentsPath, response => {
      let ignored = this.responseQueue.shift(response);
    });
  }

  async getAllComments() {
    let response = await this.socket.get<FlatCommentData[]>(ConfigProvider.get().commentsPath);

    if (response == null) {
      return [];
    }

    return asSequence(response.apply())
        .map(data => OfficialCommentProvider.createCommentDataFrom(data))
        .asIterable();
  }

  async * getNewComments() {
    while (true) {
      let response = await this.responseQueue.unshift();
      yield OfficialCommentProvider.createCommentDataFrom(response.apply());
    }
  }
}

export default OfficialCommentProvider;
