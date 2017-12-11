import Chromatic from './Chromatic';
import BuffFactory, {BuffData, BuffType} from './BuffFactory';
import Ethereal from './Ethereal';
import Controller from '../../../controller/Controller';
import Moving from './Moving';

class BuffFactoryImpl implements BuffFactory {
  constructor(private game: Phaser.Game, private controller: Controller) {
  }

  create(buffData: BuffData) {
    switch (buffData.type) {
      case BuffType.ETHEREAL:
        return this.createEthereal();
      case BuffType.CHROMATIC:
        return this.createChromatic();
      default:
        throw new TypeError(`Invalid buff type: ${buffData.type}`);
    }
  }

  createEthereal(): Ethereal {
    return Ethereal.getInstance();
  }

  createInputControllerMover() {
    return new Moving(this.controller);
  }

  createWorldWanderingMover(): never {
    throw new Error('Not Implemented');
  }

  createChromatic() {
    return new Chromatic();
  }
}

export default BuffFactoryImpl;
