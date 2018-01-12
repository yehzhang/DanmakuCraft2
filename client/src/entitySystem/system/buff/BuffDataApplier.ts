import BuffFactory from './BuffFactory';
import {Player, UpdatingCommentEntity} from '../../alias';
import BuffDataContainer from './BuffDataContainer';
import {BuffData, BuffType} from './BuffData';

class BuffDataApplier {
  constructor(
      private player: Player,
      private buffDataContainer: BuffDataContainer,
      private buffFactory: BuffFactory) {
  }

  activate(data: BuffData) {
    switch (data.type) {
      case BuffType.HASTY:
        this.buffFactory.createHasty().apply(this.player);
        break;
      case BuffType.CHROMATIC:
        this.buffDataContainer.add(data);
        break;
      case BuffType.NONE:
        return;
      default:
        throw new TypeError(`Invalid buff data: ${data}`);
    }
  }

  activateOnComment(data: BuffData, entity: UpdatingCommentEntity) {
    let buff;
    switch (data.type) {
      case BuffType.CHROMATIC:
        buff = this.buffFactory.createChromatic();
        break;
      case BuffType.NONE:
        return;
      default:
        throw new TypeError(`Invalid buff data: ${data}`);
    }

    buff.apply(entity);
  }
}

export default BuffDataApplier;
