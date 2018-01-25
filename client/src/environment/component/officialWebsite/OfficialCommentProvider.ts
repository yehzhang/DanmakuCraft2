import CommentProvider from '../../interface/CommentProvider';
import CommentData, {FlatCommentData} from '../../../comment/CommentData';
import ConfigProvider from '../../config/ConfigProvider';
import Point from '../../../util/syntax/Point';
import {BuffData} from '../../../entitySystem/system/buff/BuffData';
import Queue from '../../../util/async/Queue';
import Socket from './Socket';
import {asSequence} from 'sequency';
import {CommentCreatedData, CommentFoundData} from '../../../../../server/api/services/response';
import Jar from './Jar';

class OfficialCommentProvider implements CommentProvider {
  constructor(
      private socket: Socket,
      private nextCreationTokenJar: Jar,
      private responseQueue: Queue<FlatCommentData> = new Queue()) {
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
    this.socket.on<CommentCreatedData>(ConfigProvider.get().commentIdentity, createdData => {
      this.nextCreationTokenJar.set(createdData.nextCreationToken);
      let ignored = this.responseQueue.shift(createdData.comment);
    });
  }

  async getAllComments() {
    let response = await this.socket.get<CommentFoundData>(ConfigProvider.get().commentIdentity);

    if (response == null) {
      return [];
    }

    let value = response.apply();

    this.nextCreationTokenJar.set(value.nextCreationToken);

    return asSequence(value.comments)
        .map(data => OfficialCommentProvider.createCommentDataFrom(data))
        .asIterable();
  }

  async * getNewComments() {
    while (true) {
      let flatData = await this.responseQueue.unshift();
      yield OfficialCommentProvider.createCommentDataFrom(flatData);
    }
  }
}

export default OfficialCommentProvider;
