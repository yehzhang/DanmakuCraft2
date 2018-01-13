import {ExistentEntity} from '../entitySystem/alias';
import {Phaser, PIXI} from '../util/alias/phaser';
import Colors from './Colors';

class Renderer {
  constructor(
      private game: Phaser.Game,
      private stage: Phaser.Group = game.add.group(),
      readonly floatingLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly playersLayer: Phaser.Group = game.make.group(),
      readonly groundLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly commentsLayer: PIXI.DisplayObjectContainer = new PIXI.DisplayObjectContainer(),
      readonly updatingCommentsLayer: PIXI.DisplayObjectContainer = new PIXI.DisplayObjectContainer()) {
    stage.add(groundLayer);

    stage.add(playersLayer);

    stage.add(floatingLayer);
    floatingLayer.addChild(commentsLayer);
    commentsLayer.cacheAsBitmap = true;
    floatingLayer.addChild(updatingCommentsLayer);
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
