import {ExistentEntity} from '../entitySystem/alias';
import {Phaser} from '../util/alias/phaser';
import Colors from './Colors';

class Renderer {
  constructor(
      private game: Phaser.Game,
      private stage: Phaser.Group = game.add.group()) {
  }

  focus(entity: ExistentEntity<Phaser.Sprite>) {
    this.game.camera.follow(entity.display, Phaser.Camera.FOLLOW_LOCKON);

    // Allow camera to move out of the world.
    this.game.camera.bounds = null;

    return this;
  }

  turnOn() {
    this.stage.visible = true;
    return this;
  }

  turnOff() {
    this.stage.visible = false;
    return this;
  }

  getStage() {
    return this.stage;
  }

  async fadeIn() {
    this.game.camera.flash(Colors.BACKGROUND_NUMBER, 2500, true);
    return new Promise(resolve => {
      this.game.camera.onFlashComplete.addOnce(resolve);
    });
  }
}

export default Renderer;
