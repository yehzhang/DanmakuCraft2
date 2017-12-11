import EntityTracker from './EntityTracker';
import EntityFinder from '../util/entityFinder/EntityFinder';
import PhysicalConstants from '../PhysicalConstants';
import BackgroundColorSystem from '../entitySystem/system/regionChange/BackgroundColorSystem';
import RenderingTarget from '../render/RenderTarget';
import {CommentEntity, Player, UpdatingCommentEntity} from '../entitySystem/alias';
import RegionRenderSystem from '../entitySystem/system/regionChange/RegionRenderSystem';
import UpdateSystem from '../entitySystem/system/tick/UpdateSystem';
import Animated from './Animated';

class WorldUpdater implements Animated {
  readonly foregroundTracker: EntityTracker;
  readonly backgroundTracker: EntityTracker;
  private renderingTargets: RenderingTarget[];

  constructor(
      private game: Phaser.Game,
      player: Player,
      playersFinder: EntityFinder<Player>,
      commentEntityFinder: EntityFinder<CommentEntity>,
      updatingCommentEntityFinder: EntityFinder<UpdatingCommentEntity>) {
    let observedDisplay = new PIXI.DisplayObjectContainer();
    let foregroundRenderer = new RegionRenderSystem(observedDisplay);
    let updateSystem = new UpdateSystem(game.time);
    this.foregroundTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.getRenderRadius(game.width, game.height))
        .trackOnRegionChange(commentEntityFinder, foregroundRenderer)
        .trackOnRegionChange(updatingCommentEntityFinder, foregroundRenderer)
        .trackOnTick(updatingCommentEntityFinder, updateSystem)
        // .trackOnTick(playersFinder, new MoveObserverDisplaySystem())
        // .trackOnTick(playersFinder, new PlayMovingAnimationSystem())

        .build();


    let backgroundColorSystem = new BackgroundColorSystem(game);
    this.backgroundTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.BACKGROUND_SAMPLING_RADIUS)
        .trackOnRegionChange(commentEntityFinder, backgroundColorSystem)
        .trackOnRegionChange(updatingCommentEntityFinder, backgroundColorSystem)
        .build();

    this.renderingTargets = [
      new RenderingTarget(player, observedDisplay, 0),
    ];

    game.scale.onSizeChange.add(this.onGameResize, this);
  }

  tick(): void {
    this.foregroundTracker.tick();
    this.backgroundTracker.tick();
  }

  getRenderingTargets() {
    return this.renderingTargets.slice();
  }

  private onGameResize() {
    let samplingRadius = PhysicalConstants.getRenderRadius(this.game.width, this.game.height);
    this.foregroundTracker.updateSamplingRadius(samplingRadius);
  }
}

export default WorldUpdater;
