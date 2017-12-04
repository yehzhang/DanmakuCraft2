import Controller from '../controller/Controller';
import Mover from './Mover';

export default class BuffFactory {
  constructor(private game: Phaser.Game, private controller: Controller) {
  }

  makeInputControllerMover() {
    return new Mover(this.game.time, this.controller);
  }

  makeWorldWanderingMover() {
    throw new Error('Not Implemented');
  }
}
