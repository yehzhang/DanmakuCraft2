import EntityTracker from './EntityTracker';
import TickCallbackRegister from './TickCallbackRegister';
import Universe from '../Universe';
import ChestSystem, {
  ChestDemolisher, ChestOpener,
  ChestSpawner
} from '../entitySystem/system/ChestSystem';
import MovingAnimationSystem from '../entitySystem/system/tick/MovingAnimationSystem';
import CollisionDetectionSystem from '../entitySystem/system/existence/CollisionDetectionSystem';
import PhysicalConstants from '../PhysicalConstants';
import UpdateSystem from '../entitySystem/system/tick/UpdateSystem';
import RegionRenderSystem from '../entitySystem/system/existence/RegionRenderSystem';
import DynamicProvider from '../util/DynamicProvider';
import BackgroundColorSystem from '../entitySystem/system/existence/BackgroundColorSystem';
import AddToContainerSystem from '../entitySystem/system/existence/AddToContainerSystem';
import DisplayMoveSystem from '../entitySystem/system/tick/DisplayPositionSystem';
import SuperposedEntityRenderSystem from '../entitySystem/system/existence/SuperposedEntityRenderSystem';
import DisplayPositionSystem from '../entitySystem/system/existence/DisplayPositionSystem';
import {Phaser} from '../util/alias/phaser';
import CacheAsBitmapSystem from '../entitySystem/system/existence/CacheAsBitmapSystem';

class Updater {
  constructor(
      private time: Phaser.Time,
      private foregroundTracker: EntityTracker,
      private backgroundTracker: EntityTracker,
      readonly collisionDetectionSystem: CollisionDetectionSystem,
      readonly chestSystem: ChestSystem,
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

    let stage = universe.renderer.getStage();

    let commentsFinder = universe.commentsStorage.getFinder();
    let updatingCommentsFinder = universe.updatingCommentsStorage.getFinder();
    let chestsFinder = universe.chestsStorage.getFinder();
    let playersFinder = universe.playersStorage.getFinder();
    let commentPreviewFinder = universe.commentPreviewStorage.getFinder();

    // TODO split render related systems to another tracker called in this.render()
    let foregroundTracker = EntityTracker.newBuilder(universe.player, renderRadius)

        .applyExistenceSystem(new SuperposedEntityRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder).and(commentPreviewFinder)
        .toLiftedEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new RegionRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new CacheAsBitmapSystem())
        .toEntities().of(commentsFinder).and(chestsFinder).and(playersFinder)

        .applyExistenceSystem(new AddToContainerSystem(stage))
        .toEntities().of(chestsFinder)

        .applyExistenceSystem(new AddToContainerSystem(stage, universe.game.make.group()))
        .toEntities().of(playersFinder)

        .applyExistenceSystem(new AddToContainerSystem(stage))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new DisplayPositionSystem(universe.player))
        .toEntities().of(chestsFinder).and(playersFinder).and(commentsFinder)
        .and(updatingCommentsFinder)

        .applyExistenceSystem(new AddToContainerSystem(universe.player.display))
        .toEntities().of(commentPreviewFinder)

        .applyExistenceSystem(collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(chestSystem).toEntities().of(chestsFinder)

        .applyTickSystem(new UpdateSystem(universe.game.time))
        .toEntities().of(playersFinder).and(commentPreviewFinder)
        .toLiftedEntities().of(updatingCommentsFinder)

        .applyTickSystem(new DisplayMoveSystem()).toEntities().of(playersFinder)

        .applyTickSystem(new MovingAnimationSystem()).toEntities().of(playersFinder)

        .applyTickSystem(chestSystem).toEntities().of(chestsFinder)

        .build();

    let backgroundTracker = EntityTracker.newBuilder(
        universe.player, new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS))

        .applyExistenceSystem(new BackgroundColorSystem(universe.game))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    return new this(
        universe.game.time,
        foregroundTracker,
        backgroundTracker,
        collisionDetectionSystem,
        chestSystem);
  }

  private static getRenderRadius(game: Phaser.Game) {
    return PhysicalConstants.getRenderRadius(game.width, game.height);
  }

  update() {
    this.foregroundTracker.tick(this.time);
    this.backgroundTracker.tick(this.time);
    this.tickCallbackRegister.update();
  }

  render() {
    this.tickCallbackRegister.render();
  }
}

export default Updater;
