import {ChestEntity, CommentEntity, Player, SignEntity, UpdatingCommentEntity} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import ChestSystem from '../../entitySystem/system/ChestSystem';
import SystemFactory from '../../entitySystem/system/SystemFactory';
import BackgroundColorSystem from '../../entitySystem/system/visibility/BackgroundColorSystem';
import BlinkSupportedRenderSystem from '../../entitySystem/system/visibility/BlinkSupportedRenderSystem';
import CachedChunksRenderSystem from '../../entitySystem/system/visibility/CachedChunksRenderSystem';
import CachedRenderSystem from '../../entitySystem/system/visibility/CachedRenderSystem';
import CollisionDetectionSystem from '../../entitySystem/system/visibility/CollisionDetectionSystem';
import CommitMotionSystem from '../../entitySystem/system/visibility/CommitMotionSystem';
import ContainerSystem from '../../entitySystem/system/visibility/ContainerSystem';
import MovingAnimationSystem from '../../entitySystem/system/visibility/MovingAnimationSystem';
import RenderSystem from '../../entitySystem/system/visibility/RenderSystem';
import UnmovableDisplayPositioningSystem from '../../entitySystem/system/visibility/UnmovableDisplayPositioningSystem';
import UpdateSystem from '../../entitySystem/system/visibility/UpdateSystem';
import PhysicalConstants from '../../PhysicalConstants';
import Renderer from '../../render/Renderer';
import {Phaser} from '../../util/alias/phaser';
import DynamicProvider from '../../util/DynamicProvider';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import EntityStorage from '../../util/entityStorage/EntityStorage';
import SystemEnginesEngine from '../SystemEnginesEngine';
import VisibilityEngine from './VisibilityEngine';

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
      commentsFinder: EntityFinder<CommentEntity>,
      updatingCommentsFinder: EntityFinder<UpdatingCommentEntity>,
      chestsStorage: EntityStorage<ChestEntity>,
      playersFinder: EntityFinder<Player>,
      spawnPointsFinder: EntityFinder<Entity>,
      signsFinder: EntityFinder<SignEntity>,
      renderer: Renderer) {
    const renderRadius = new DynamicProvider(getRenderRadius(game));
    game.scale.onSizeChange.add(() => renderRadius.update(getRenderRadius(game)));

    const collisionDetectionSystem = new CollisionDetectionSystem();

    const chestSystem = systemFactory.createChestSystem(renderRadius, chestsStorage);

    const foregroundTrackerBuilder = VisibilityEngine.newBuilder(
        player,
        renderRadius,
        PhysicalConstants.FOREGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS);
    foregroundTrackerBuilder.onUpdate()
    // Update buffs
        .apply(new UpdateSystem())
        .toEntities().of(playersFinder).and(updatingCommentsFinder)

        .apply(collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .apply(chestSystem)
        .toEntities().of(chestsStorage);

    const positioningSystem = new UnmovableDisplayPositioningSystem(player);
    foregroundTrackerBuilder.onRender()
    // Render
        .apply(new BlinkSupportedRenderSystem(
            renderer.floatingLayer,
            new CachedChunksRenderSystem(renderer.floatingLayer, positioningSystem),
            new RenderSystem(renderer.floatingLayer),
            positioningSystem))
        .toEntities().of(commentsFinder)

        .apply(new RenderSystem(renderer.floatingLayer))
        .toEntities().of(updatingCommentsFinder)

        .apply(new RenderSystem(renderer.groundLayer))
        .toEntities().of(chestsStorage)

        .apply(new RenderSystem(renderer.playersLayer))
        .toEntities().of(playersFinder)

        .apply(new CachedRenderSystem(renderer.backgroundLayer))
        .toEntities().of(signsFinder)

        .apply(positioningSystem)
        .toEntities()
        .of(updatingCommentsFinder).and(chestsStorage).and(signsFinder)

        .apply(new MovingAnimationSystem())
        .toEntities().of(playersFinder)

        .apply(new CommitMotionSystem())
        .toEntities().of(playersFinder);

    const spawnPointsContainerSystem = new ContainerSystem<Entity>();

    const backgroundTrackerBuilder = VisibilityEngine.newBuilder(
        player,
        new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS),
        PhysicalConstants.BACKGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS);
    backgroundTrackerBuilder.onRender()
        .apply(spawnPointsContainerSystem)
        .toEntities().of(spawnPointsFinder)

        .apply(new BackgroundColorSystem(game, spawnPointsContainerSystem))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder);

    return new Visibility(
        [foregroundTrackerBuilder.build(), backgroundTrackerBuilder.build()],
        collisionDetectionSystem,
        chestSystem);
  }
}

export function getRenderRadius(game: Phaser.Game) {
  return PhysicalConstants.getRenderRadius(game.width, game.height);
}

export default Visibility;
