import {ExistentEntity} from '../entitySystem/alias';

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
    this.game.world.bringToTop(this.stage);

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
}

export default Renderer;
