import {Observer} from '../entitySystem/alias';
import RenderingTarget from './RenderTarget';

export default class Renderer {
  private container: PhaserDisplayObjectContainer;
  private renderingObservers: Set<Observer>;

  constructor(private game: Phaser.Game, renderingTargets: RenderingTarget[]) {
    this.container = game.add.group();

    // Make game less blurry
    // No need to turn on when anti-aliasing is turned off.
    // game.renderer.renderSession.roundPixels = true;
    // TODO need this for more sharpness?
    // Phaser.Canvas.setImageRenderingCrisp(game.canvas);

    // Allow camera to move out of the world.
    game.camera.bounds = null;

    this.addRenderingTargetsToStage(renderingTargets);

    this.renderingObservers = new Set(renderingTargets.map(target => target.observer));
  }

  focusOn(observer: Observer) {
    if (!this.renderingObservers.has(observer)) {
      throw new Error('Cannot focus on a observer that is not a rendering target');
    }

    this.game.camera.follow(observer.display, Phaser.Camera.FOLLOW_LOCKON);

    return this;
  }

  turnOn() {
    this.game.world.bringToTop(this.container);

    this.container.visible = true;

    return this;
  }

  turnOff() {
    this.container.visible = false;
    return this;
  }

  private addRenderingTargetsToStage(renderingTargets: RenderingTarget[]) {
    renderingTargets = renderingTargets.sort((target, other) => target.zIndex - other.zIndex);

    let uniqueZIndices = new Set(renderingTargets.map(target => target.zIndex));
    if (uniqueZIndices.size !== renderingTargets.length) {
      throw new TypeError('Render targets have duplicate zIndices');
    }

    let projectorGroup = new PhaserDisplayObjectContainer();
    for (let renderingTarget of renderingTargets) {
      this.container.addChild(renderingTarget.observer.display);
      projectorGroup.addChild(renderingTarget.observerDisplay);
    }

    this.container.addChild(projectorGroup);
  }
}

class PhaserDisplayObjectContainer extends PIXI.DisplayObjectContainer {
  // noinspection JSUnusedGlobalSymbols
  update() {
  }

  // noinspection JSUnusedGlobalSymbols
  postUpdate() {
  }
}
