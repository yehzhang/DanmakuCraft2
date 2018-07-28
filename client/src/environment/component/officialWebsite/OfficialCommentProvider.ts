import {asSequence} from 'sequency';
import {CommentCreatedData, CommentFoundData} from '../../../../../server/api/services/response';
import CommentData, {FlatCommentData} from '../../../comment/CommentData';
import {BuffData} from '../../../entitySystem/system/buff/BuffData';
import Queue from '../../../util/async/Queue';
import Point from '../../../util/syntax/Point';
import ConfigProvider from '../../config/ConfigProvider';
import CommentProvider from '../../interface/CommentProvider';
import Jar from './Jar';
import Socket from './Socket';

class OfficialCommentProvider implements CommentProvider {
  constructor(
      private socket: Socket,
      private nextCreationTokenJar: Jar,
      private responseQueue: Queue<FlatCommentData> = new Queue()) {
  }

  connect() {
    this.socket.on<CommentCreatedData>(ConfigProvider.get().commentIdentity, createdData => {
      this.nextCreationTokenJar.set(createdData.nextCreationToken);
      const ignored = this.responseQueue.push(createdData.comment);
    });
  }

  async getAllComments() {
    const response = await this.socket.get<CommentFoundData>(ConfigProvider.get().commentIdentity);
    if (!response) {
      return [];
    }

    const value = response.apply();

    this.nextCreationTokenJar.set(value.nextCreationToken);

    return asSequence(value.comments)
        .map(data => createCommentDataFrom(data))
        .asIterable();
  }

  async * getNewComments() {
    while (true) {
      const flatData = await this.responseQueue.shift();
      yield createCommentDataFrom(flatData);
    }
  }
}

function createCommentDataFrom(flatData: FlatCommentData) {
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

export default OfficialCommentProvider;
