import VisibilityEngine from './VisibilityEngine';
import Universe from '../../Universe';
import ChestSystem, {
  ChestDemolisher, ChestOpener,
  ChestSpawner
} from '../../entitySystem/system/ChestSystem';
import MovingAnimationSystem from '../../entitySystem/system/visibility/MovingAnimationSystem';
import CollisionDetectionSystem from '../../entitySystem/system/visibility/CollisionDetectionSystem';
import PhysicalConstants from '../../PhysicalConstants';
import UpdateSystem from '../../entitySystem/system/visibility/UpdateSystem';
import DynamicProvider from '../../util/DynamicProvider';
import BackgroundColorSystem from '../../entitySystem/system/visibility/BackgroundColorSystem';
import AddChildSystem from '../../entitySystem/system/visibility/AddChildSystem';
import UnmovableDisplayPositioningSystem from '../../entitySystem/system/visibility/UnmovableDisplayPositioningSystem';
import {Phaser} from '../../util/alias/phaser';
import CommitMotionSystem from '../../entitySystem/system/visibility/CommitMotionSystem';
import MoveDisplaySystem from '../../entitySystem/system/tick/MoveDisplaySystem';
import SynchronizeLifecycleSystem from '../../entitySystem/system/visibility/SynchronizeLifecycleSystem';
import SystemEnginesEngine from '../SystemEnginesEngine';

class Visibility extends SystemEnginesEngine<VisibilityEngine> {
  constructor(
      engines: VisibilityEngine[],
      readonly collisionDetectionSystem: CollisionDetectionSystem,
      readonly synchronizeUpdateSystem: SynchronizeLifecycleSystem,
      readonly synchronizeRenderSystem: SynchronizeLifecycleSystem) {
    super(engines);
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

    let synchronizeUpdateSystem = new SynchronizeLifecycleSystem();
    let synchronizeRenderSystem = new SynchronizeLifecycleSystem();

    let commentsFinder = universe.commentsStorage.getFinder();
    let updatingCommentsFinder = universe.updatingCommentsStorage.getFinder();
    let chestsFinder = universe.chestsStorage.getFinder();
    let playersFinder = universe.playersStorage.getFinder();
    let commentPreviewFinder = universe.commentPreviewStorage.getFinder();

    let player = universe.player;

    let foregroundTrackerBuilder = VisibilityEngine.newBuilder(player, renderRadius);
    foregroundTrackerBuilder.onUpdate()
        .applyVisibilitySystem(new UpdateSystem())
        .toEntities().of(playersFinder).and(commentPreviewFinder)
        .toChildren().of(updatingCommentsFinder)

        .applyVisibilitySystem(collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyVisibilitySystem(chestSystem)
        .toEntities().of(chestsFinder)
        .applyTickSystem(chestSystem)

        .applyTickSystem(synchronizeUpdateSystem);

    foregroundTrackerBuilder.onRender()
        .applyVisibilitySystem(new AddChildSystem(universe.renderer.commentsLayer))
        .toEntities().of(commentsFinder)
    // TODO share the same sprite among chromatic comments.
        .applyVisibilitySystem(new AddChildSystem(universe.renderer.updatingCommentsLayer))
        .toEntities().of(updatingCommentsFinder)
        .applyVisibilitySystem(new AddChildSystem(universe.renderer.groundLayer))
        .toEntities().of(chestsFinder)
        .applyVisibilitySystem(new AddChildSystem(universe.renderer.playersLayer))
        .toEntities().of(playersFinder)
        .applyVisibilitySystem(new UnmovableDisplayPositioningSystem(player))
        .toEntities().of(chestsFinder).and(commentsFinder).and(updatingCommentsFinder)

        .applyVisibilitySystem(new AddChildSystem(player.display))
        .toEntities().of(commentPreviewFinder)

        .applyTickSystem(new MoveDisplaySystem(player))

        .applyVisibilitySystem(new MovingAnimationSystem())
        .toEntities().of(playersFinder)

        .applyTickSystem(synchronizeRenderSystem)

        .applyVisibilitySystem(new CommitMotionSystem())
        .toEntities().of(playersFinder);

    let backgroundTrackerBuilder = VisibilityEngine.newBuilder(
        player, new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS));
    backgroundTrackerBuilder.onRender()
        .applyVisibilitySystem(new BackgroundColorSystem(universe.game))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder);

    return new this(
        [foregroundTrackerBuilder.build(), backgroundTrackerBuilder.build()],
        collisionDetectionSystem,
        synchronizeUpdateSystem,
        synchronizeRenderSystem);
  }

  private static getRenderRadius(game: Phaser.Game) {
    return PhysicalConstants.getRenderRadius(game.width, game.height);
  }
}

export default Visibility;
