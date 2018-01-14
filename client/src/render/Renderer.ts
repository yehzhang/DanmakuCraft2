import {Phaser, PIXI} from '../util/alias/phaser';
import Colors from './Colors';
import Display from '../entitySystem/component/Display';

class Renderer {
  constructor(
      private game: Phaser.Game,
      private stage: Phaser.Group = game.add.group(),
      readonly floatingLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly playersLayer: Phaser.Group = game.make.group(),
      readonly groundLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly cachedBackgroundLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly cachedCommentsLayer: PIXI.DisplayObjectContainer = new PIXI.DisplayObjectContainer(),
      readonly commentsLayer: PIXI.DisplayObjectContainer = new PIXI.DisplayObjectContainer()) {
    stage.add(cachedBackgroundLayer);
    cachedBackgroundLayer.cacheAsBitmap = true;

    stage.add(groundLayer);

    stage.add(playersLayer);

    stage.add(floatingLayer);
    floatingLayer.addChild(cachedCommentsLayer);
    cachedCommentsLayer.cacheAsBitmap = true;
    floatingLayer.addChild(commentsLayer);
  }

  focus(entity: Display<Phaser.Sprite>) {
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

  async fadeIn() {
    this.game.camera.flash(Colors.BACKGROUND_NUMBER, 2500, true);
    return new Promise(resolve => {
      this.game.camera.onFlashComplete.addOnce(resolve);
    });
  }
}

export default Renderer;

export interface PhaserDisplayContainer extends PIXI.DisplayObjectContainer {
  preUpdate(): void;

  update(): void;

  postUpdate(): void;
}

export class BridgingContainer extends PIXI.DisplayObjectContainer {
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
