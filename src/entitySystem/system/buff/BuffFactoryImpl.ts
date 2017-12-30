import Chromatic, {BouncingColorTransition} from './Chromatic';
import BuffFactory, {BuffData, BuffType} from './BuffFactory';
import Ethereal from './Ethereal';
import Controller from '../../../controller/Controller';
import Moving from './Moving';
import DataGeneratorFactory from '../../../util/dataGenerator/DataGeneratorFactory';

class BuffFactoryImpl implements BuffFactory {
  constructor(
      private game: Phaser.Game,
      private controller: Controller,
      private dataGeneratorFactory: DataGeneratorFactory) {
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
    return new Chromatic(
        new BouncingColorTransition(this.dataGeneratorFactory.getColorTransitionSpeedGenerator()),
        new BouncingColorTransition(this.dataGeneratorFactory.getColorTransitionSpeedGenerator()),
        new BouncingColorTransition(this.dataGeneratorFactory.getColorTransitionSpeedGenerator()));
  }
}

export default BuffFactoryImpl;
