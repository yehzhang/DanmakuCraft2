import Chromatic, {BouncingColorTransition} from './Chromatic';
import BuffFactory from './BuffFactory';
import Controller from '../../../input/Controller';
import Moving from './Moving';
import Hasty from './Hasty';
import LawFactory from '../../../law/LawFactory';
import {Phaser} from '../../../util/alias/phaser';

class BuffFactoryImpl implements BuffFactory {
  constructor(
      private game: Phaser.Game,
      private controller: Controller,
      private lawFactory: LawFactory) {
  }

  createInputControllerMover() {
    return new Moving(this.controller);
  }

  createWorldWanderingMover(): never {
    throw new Error('Not Implemented');
  }

  createChromatic() {
    return new Chromatic(
        new BouncingColorTransition(this.lawFactory.createColorTransitionLaw()),
        new BouncingColorTransition(this.lawFactory.createColorTransitionLaw()),
        new BouncingColorTransition(this.lawFactory.createColorTransitionLaw()));
  }

  createHasty() {
    return new Hasty();
  }
}

export default BuffFactoryImpl;
