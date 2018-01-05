import {BuffData, BuffType} from './BuffFactory';
import Texts from '../../../render/Texts';

class BuffDescription {
  for(data: BuffData): string {
    switch (data.type) {
      case BuffType.ETHEREAL:
        return Texts.forName('main.buff.description.ethereal');
      case BuffType.CHROMATIC:
        return Texts.forName('main.buff.description.chromatic');
      case BuffType.HASTY:
        return Texts.forName('main.buff.description.hasty');
      default:
        throw new TypeError(`Invalid buff data: ${data}`);
    }
  }
}

export default BuffDescription;
