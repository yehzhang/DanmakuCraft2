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
import SystemEnginesEngine from '../SystemEnginesEngine';
import {
  ChestEntity,
  CommentEntity,
  Player,
  Region,
  SignEntity,
  UpdatingCommentEntity
} from '../../entitySystem/alias';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import SystemFactory from '../../entitySystem/system/SystemFactory';
import EntityStorage from '../../util/entityStorage/EntityStorage';
import Renderer from '../../render/Renderer';
import ContainerSystem from '../../entitySystem/system/visibility/ContainerSystem';
import Entity from '../../entitySystem/Entity';
import BlinkCachedDisplaySystem from '../../entitySystem/system/visibility/BlinkCachedDisplaySystem';
import ChestSystem from '../../entitySystem/system/ChestSystem';

class Visibility extends SystemEnginesEngine<VisibilityEngine> {
  constructor(
      engines: VisibilityEngine[],
      readonly collisionDetectionSystem: CollisionDetectionSystem,
      readonly chestSystem: ChestSystem) {
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
      spawnPointsFinder: EntityFinder<Entity>,
      signsFinder: EntityFinder<SignEntity>,
      renderer: Renderer) {
    let renderRadius = new DynamicProvider(this.getRenderRadius(game));
    game.scale.onSizeChange.add(() => renderRadius.update(this.getRenderRadius(game)));

    let collisionDetectionSystem = new CollisionDetectionSystem();

    let chestSystem = systemFactory.createChestSystem(renderRadius, chestsStorage.getRegister());
    let chestsFinder = chestsStorage.getFinder();

    let foregroundTrackerBuilder = VisibilityEngine.newBuilder(player, renderRadius);
    foregroundTrackerBuilder.onUpdate()
    // Update buffs
        .apply(new UpdateSystem())
        .toEntities().of(playersFinder)
        .toChildren().of(updatingCommentsFinder)

        .apply(collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .apply(chestSystem)
        .toEntities().of(chestsFinder);

    let addUncachedCommentsSystem = new AddChildSystem(renderer.floatingLayer);
    let addCachedCommentsSystem = new AddChildSystem(renderer.floatingLayer, true);
    let positioningSystem = new UnmovableDisplayPositioningSystem(player);

    foregroundTrackerBuilder.onRender()
    // Render
        .apply(addCachedCommentsSystem)
        .toEntities().of(commentsFinder)
        .apply(addUncachedCommentsSystem)
        .toEntities().of(updatingCommentsFinder)
        .apply(new AddChildSystem(renderer.groundLayer))
        .toEntities().of(chestsFinder)
        .apply(new AddChildSystem(renderer.playersLayer))
        .toEntities().of(playersFinder)
        .apply(new AddChildSystem(renderer.cachedBackgroundLayer))
        .toEntities().of(signsFinder)
        .apply(positioningSystem)
        .toEntities()
        .of(chestsFinder).and(commentsFinder).and(updatingCommentsFinder).and(signsFinder)

    // Blink entities that are displayed in cached layers.
        .apply(new BlinkCachedDisplaySystem(
            positioningSystem,
            addCachedCommentsSystem,
            addUncachedCommentsSystem))
        .toEntities().of(commentsFinder)

        .apply(new MovingAnimationSystem())
        .toEntities().of(playersFinder)

        .apply(new CommitMotionSystem())
        .toEntities().of(playersFinder);

    let spawnPointsContainerSystem = new ContainerSystem<Entity>();

    let backgroundTrackerBuilder = VisibilityEngine.newBuilder(
        player, new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS));
    backgroundTrackerBuilder.onRender()
        .apply(spawnPointsContainerSystem)
        .toEntities().of(spawnPointsFinder)

        .apply(new BackgroundColorSystem(game, spawnPointsContainerSystem))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder);

    return new this(
        [foregroundTrackerBuilder.build(), backgroundTrackerBuilder.build()],
        collisionDetectionSystem,
        chestSystem);
  }

  private static getRenderRadius(game: Phaser.Game) {
    return PhysicalConstants.getRenderRadius(game.width, game.height);
  }
}

export default Visibility;
