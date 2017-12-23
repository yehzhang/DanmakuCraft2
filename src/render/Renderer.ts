class Renderer {
  constructor(
      private game: Phaser.Game,
      private observerDisplay: Phaser.Sprite,
      private observedDisplay: PIXI.DisplayObjectContainer = new PhaserDisplayObjectContainer(),
      private stage: Phaser.Group = game.add.group()) {
    stage.add(observerDisplay);
    stage.add(observedDisplay);
  }

  focus() {
    this.game.camera.follow(this.observerDisplay, Phaser.Camera.FOLLOW_LOCKON);

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

  getObservedDisplay() {
    return this.observedDisplay;
  }
}

export default Renderer;

class PhaserDisplayObjectContainer extends PIXI.DisplayObjectContainer {
  // noinspection JSUnusedGlobalSymbols
  preUpdate() {
  }

  // noinspection JSUnusedGlobalSymbols
  update() {
  }

  // noinspection JSUnusedGlobalSymbols
  postUpdate() {
  }
}
