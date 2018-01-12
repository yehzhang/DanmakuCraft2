import EntityTracker from './EntityTracker';
import TickCallbackRegister from './TickCallbackRegister';
import Universe from '../Universe';
import ChestSystem, {
  ChestDemolisher, ChestOpener,
  ChestSpawner
} from '../entitySystem/system/ChestSystem';
import MovingAnimationSystem from '../entitySystem/system/existence/MovingAnimationSystem';
import CollisionDetectionSystem from '../entitySystem/system/existence/CollisionDetectionSystem';
import PhysicalConstants from '../PhysicalConstants';
import UpdateSystem from '../entitySystem/system/existence/UpdateSystem';
import RegionRenderSystem from '../entitySystem/system/existence/RegionRenderSystem';
import DynamicProvider from '../util/DynamicProvider';
import BackgroundColorSystem from '../entitySystem/system/existence/BackgroundColorSystem';
import AddToContainerSystem from '../entitySystem/system/existence/AddToContainerSystem';
import SuperposedEntityRenderSystem from '../entitySystem/system/existence/SuperposedEntityRenderSystem';
import UnmovableDisplayPositioningSystem from '../entitySystem/system/existence/UnmovableDisplayPositioningSystem';
import {Phaser} from '../util/alias/phaser';
import CacheAsBitmapSystem from '../entitySystem/system/existence/CacheAsBitmapSystem';
import CommitMotionSystem from '../entitySystem/system/existence/CommitMotionSystem';
import MoveDisplaySystem from '../entitySystem/system/tick/MoveDisplaySystem';

class Updater {
  constructor(
      private game: Phaser.Game,
      private time: Phaser.Time,
      private foregroundTracker: EntityTracker,
      private backgroundTracker: EntityTracker,
      readonly collisionDetectionSystem: CollisionDetectionSystem,
      readonly tickCallbackRegister: TickCallbackRegister = new TickCallbackRegister()) {
  }

  static on(universe: Universe) {
    let renderRadius = new DynamicProvider(this.getRenderRadius(universe.game));
    universe.game.scale.onSizeChange.add(() => renderRadius.update(this.getRenderRadius(universe.game)));

    let chestLaw =
        universe.lawFactory.createChestLaw(universe.player, renderRadius, __DEV__ ? 1 : undefined);
    let chestSystem = new ChestSystem(
        new ChestOpener(
            universe.game,
            universe.player,
            universe.buffDataApplier,
            chestLaw,
            universe.notifier,
            universe.buffDescription),
        new ChestSpawner(
            universe.chestsStorage.getRegister(),
            universe.entityFactory,
            chestLaw),
        new ChestDemolisher(universe.chestsStorage.getRegister()));

    let collisionDetectionSystem = new CollisionDetectionSystem();

    // floatingLayer.cacheAsBitmap = true;

    let commentsFinder = universe.commentsStorage.getFinder();
    let updatingCommentsFinder = universe.updatingCommentsStorage.getFinder();
    let chestsFinder = universe.chestsStorage.getFinder();
    let playersFinder = universe.playersStorage.getFinder();
    let commentPreviewFinder = universe.commentPreviewStorage.getFinder();

    // TODO split render related systems to another tracker called in this.render()
    let foregroundTrackerBuilder = EntityTracker.newBuilder(universe.player, renderRadius);
    foregroundTrackerBuilder.onUpdate()
        .applyExistenceSystem(new UpdateSystem())
        .toEntities().of(playersFinder)

        .applyExistenceSystem(collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(chestSystem)
        .toEntities().of(chestsFinder)
        .applyTickSystem(chestSystem);

    foregroundTrackerBuilder.onRender()
        .applyExistenceSystem(new SuperposedEntityRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder).and(commentPreviewFinder)
        .toChildren().of(commentsFinder).and(updatingCommentsFinder)
        .applyExistenceSystem(new RegionRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)
        .applyExistenceSystem(new CacheAsBitmapSystem())
        .toEntities().of(commentsFinder).and(chestsFinder).and(playersFinder)

    // TODO move to onUpdate
        .applyExistenceSystem(new UpdateSystem())
        .toEntities().of(commentPreviewFinder)
        .toChildren().of(updatingCommentsFinder)

        .applyExistenceSystem(new AddToContainerSystem(universe.renderer.floatingLayer))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)
        .applyExistenceSystem(new AddToContainerSystem(universe.renderer.groundLayer))
        .toEntities().of(chestsFinder)
        .applyExistenceSystem(new AddToContainerSystem(universe.renderer.playersLayer))
        .toEntities().of(playersFinder)
        .applyExistenceSystem(new UnmovableDisplayPositioningSystem(universe.player))
        .toEntities().of(chestsFinder).and(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new AddToContainerSystem(universe.player.display))
        .toEntities().of(commentPreviewFinder)

        .applyTickSystem(new MoveDisplaySystem(universe.player))

        .applyExistenceSystem(new MovingAnimationSystem())
        .toEntities().of(playersFinder)

        .applyExistenceSystem(new CommitMotionSystem())
        .toEntities().of(playersFinder);

    let backgroundTrackerBuilder = EntityTracker.newBuilder(
        universe.player, new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS));
    backgroundTrackerBuilder.onRender()
        .applyExistenceSystem(new BackgroundColorSystem(universe.game))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder);

    return new this(
        universe.game,
        universe.game.time,
        foregroundTrackerBuilder.build(),
        backgroundTrackerBuilder.build(),
        collisionDetectionSystem);
  }

  private static getRenderRadius(game: Phaser.Game) {
    return PhysicalConstants.getRenderRadius(game.width, game.height);
  }

  update() {
    this.foregroundTracker.update(this.time);
    this.backgroundTracker.update(this.time);
    // TODO remove tickCallbackRegister
    this.tickCallbackRegister.update();
  }

  render() {
    this.foregroundTracker.render(this.time);
    this.backgroundTracker.render(this.time);
    // TODO remove tickCallbackRegister
    this.tickCallbackRegister.render();
  }
}

export default Updater;
