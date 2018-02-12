import {Phaser, PIXI} from '../util/alias/phaser';
import Display from '../entitySystem/component/Display';
import Point from '../util/syntax/Point';

/**
 * Holds layers of displays and manages their order.
 * Children added to a higher layer will appear on the top of children added to a lower layer.
 *
 * Never cache layer. Instead, cache child displays individually.
 */
class Renderer {
  constructor(
      private game: Phaser.Game,
      private stage: Phaser.Group = game.add.group(),
      readonly floatingLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly playersLayer: Phaser.Group = game.make.group(),
      readonly groundLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly backgroundLayer: PhaserDisplayContainer = new BridgingContainer(),
      readonly fixedToCameraLayer: Phaser.Group = game.make.group()) {
    stage.add(backgroundLayer);

    stage.add(groundLayer);

    stage.add(playersLayer);

    stage.add(floatingLayer);

    stage.add(fixedToCameraLayer);
    fixedToCameraLayer.fixedToCamera = true;
    this.onGameSizeChanged();
    this.game.scale.onSizeChange.add(this.onGameSizeChanged, this);
  }

  focus(entity: Display<Phaser.Sprite>) {
    this.game.camera.follow(entity.display, Phaser.Camera.FOLLOW_LOCKON, 0.08, 0.08);

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

  private onGameSizeChanged() {
    this.fixedToCameraLayer.cameraOffset = Point.of(this.game.width / 2, this.game.height / 2);
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
