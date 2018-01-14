import VisibilityEngine from './VisibilityEngine';
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
import {
  ChestEntity, CommentEntity, Player, Region, SignEntity,
  UpdatingCommentEntity
} from '../../entitySystem/alias';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import SystemFactory from '../../entitySystem/system/SystemFactory';
import EntityStorage from '../../util/entityStorage/EntityStorage';
import Renderer from '../../render/Renderer';
import ContainerSystem from '../../entitySystem/system/visibility/ContainerSystem';
import Entity from '../../entitySystem/Entity';

class Visibility extends SystemEnginesEngine<VisibilityEngine> {
  constructor(
      engines: VisibilityEngine[],
      readonly collisionDetectionSystem: CollisionDetectionSystem,
      readonly synchronizeUpdateSystem: SynchronizeLifecycleSystem,
      readonly synchronizeRenderSystem: SynchronizeLifecycleSystem) {
    super(engines);
  }

  static on(
      game: Phaser.Game,
      player: Player,
      systemFactory: SystemFactory,
      commentsFinder: EntityFinder<Region<CommentEntity>>,
      updatingCommentsFinder: EntityFinder<Region<UpdatingCommentEntity>>,
      chestsStorage: EntityStorage<ChestEntity>,
      playersFinder: EntityFinder<Player>,
      commentPreviewFinder: EntityFinder<UpdatingCommentEntity>,
      spawnPointsFinder: EntityFinder<Entity>,
      signsFinder: EntityFinder<SignEntity>,
      renderer: Renderer) {
    let renderRadius = new DynamicProvider(this.getRenderRadius(game));
    game.scale.onSizeChange.add(() => renderRadius.update(this.getRenderRadius(game)));

    let collisionDetectionSystem = new CollisionDetectionSystem();

    let synchronizeUpdateSystem = new SynchronizeLifecycleSystem();
    let synchronizeRenderSystem = new SynchronizeLifecycleSystem();

    let spawnPointsContainerSystem = new ContainerSystem<Entity>();

    let chestSystem = systemFactory.createChestSystem(renderRadius, chestsStorage.getRegister());
    let chestsFinder = chestsStorage.getFinder();

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
        .applyVisibilitySystem(new AddChildSystem(renderer.commentsLayer))
        .toEntities().of(commentsFinder)
    // TODO share the same sprite among chromatic comments.
        .applyVisibilitySystem(new AddChildSystem(renderer.updatingCommentsLayer))
        .toEntities().of(updatingCommentsFinder)
        .applyVisibilitySystem(new AddChildSystem(renderer.groundLayer))
        .toEntities().of(chestsFinder)
        .applyVisibilitySystem(new AddChildSystem(renderer.playersLayer))
        .toEntities().of(playersFinder)
        .applyVisibilitySystem(new AddChildSystem(renderer.backgroundLayer))
        .toEntities().of(signsFinder)
        .applyVisibilitySystem(new UnmovableDisplayPositioningSystem(player))
        .toEntities()
        .of(chestsFinder).and(commentsFinder).and(updatingCommentsFinder).and(signsFinder)

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
        .applyVisibilitySystem(spawnPointsContainerSystem)
        .toEntities().of(spawnPointsFinder)

        .applyVisibilitySystem(new BackgroundColorSystem(game, spawnPointsContainerSystem))
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
