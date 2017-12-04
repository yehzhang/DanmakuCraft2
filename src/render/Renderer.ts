import {Observer} from '../entity/entity';
import {default as WorldUpdater} from '../update/WorldUpdater';

export default class Renderer {
  private container: PhaserDisplayObjectContainer;
  private renderingObservers: Set<Observer>;

  constructor(private game: Phaser.Game, worldUpdater: WorldUpdater) {
    this.container = game.add.group();

    // Make game less blurry
    // No need to turn on when anti-aliasing is turned off.
    // game.renderer.renderSession.roundPixels = true;
    // TODO need this for more sharpness?
    // Phaser.Canvas.setImageRenderingCrisp(game.canvas);

    // Allow camera to move out of the world.
    game.camera.bounds = null as any;

    // Add rendering targets to stage.
    let renderingTargets = worldUpdater.getRenderingTargets()
        .sort((target, other) => target.zIndex - other.zIndex);
    let projectorGroup = new PhaserDisplayObjectContainer();
    this.container.addChild(projectorGroup);
    for (let renderingTarget of renderingTargets) {
      this.container.addChild(renderingTarget.observer.display());
      projectorGroup.addChild(renderingTarget.projector.display());
    }

    this.renderingObservers = new Set(renderingTargets.map(target => target.observer));
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

  focusOn(observer: Observer) {
    if (!this.renderingObservers.has(observer)) {
      throw new Error('Cannot focus on a observer that is not a rendering target');
    }

    this.game.camera.follow(observer.display(), Phaser.Camera.FOLLOW_LOCKON);

    return this;
  }
}

class PhaserDisplayObjectContainer extends PIXI.DisplayObjectContainer {
  update() {
  }

  postUpdate() {
  }
}
