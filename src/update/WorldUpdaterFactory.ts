import SuperposedEntityRenderSystem from '../entitySystem/system/existence/SuperposedEntityRenderSystem';
import EntityTracker from './EntityTracker';
import BackgroundColorSystem from '../entitySystem/system/existence/BackgroundColorSystem';
import ContainerRenderSystem from '../entitySystem/system/existence/ContainerRenderSystem';
import UpdateSystem from '../entitySystem/system/tick/UpdateSystem';
import DisplayMoveSystem from '../entitySystem/system/tick/DisplayPositionSystem';
import PhysicalConstants from '../PhysicalConstants';
import MovingAnimationSystem from '../entitySystem/system/tick/MovingAnimationSystem';
import WorldUpdater from './WorldUpdater';
import {CommentEntity, Player, Region, UpdatingCommentEntity} from '../entitySystem/alias';
import EntityFinder from '../util/entityStorage/EntityFinder';
import CollisionDetectionSystem from '../entitySystem/system/existence/CollisionDetectionSystem';

class WorldUpdaterFactory {
  constructor(private game: Phaser.Game) {
  }

  createWorldUpdater(
      player: Player,
      observedDisplay: PIXI.DisplayObjectContainer,
      collisionDetectionSystem: CollisionDetectionSystem,
      playersFinder: EntityFinder<Player>,
      commentsFinder: EntityFinder<Region<CommentEntity>>,
      updatingCommentsFinder: EntityFinder<Region<UpdatingCommentEntity>>) {
    let foregroundTracker = EntityTracker.newBuilder(player, this.getRenderRadius())
        .applyTickSystem(new UpdateSystem(this.game.time))
        .toEntities().of(playersFinder)
        .toLiftedEntities().of(updatingCommentsFinder)

        .applyTickSystem(new DisplayMoveSystem())
        .toEntities().of(playersFinder)

        .applyTickSystem(new MovingAnimationSystem())
        .toEntities().of(playersFinder)

        .applyExistenceSystem(new SuperposedEntityRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)
        .toLiftedEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new ContainerRenderSystem(observedDisplay))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    // TODO apply distance render system to .and(playersFinder)

    let backgroundTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.BACKGROUND_SAMPLING_RADIUS)

        .applyExistenceSystem(new BackgroundColorSystem(this.game))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    let updater = new WorldUpdater(foregroundTracker, backgroundTracker);

    this.game.scale.onSizeChange.add(() => updater.updateRenderRadius(this.getRenderRadius()));

    return updater;
  }

  private getRenderRadius() {
    return PhysicalConstants.getRenderRadius(this.game.width, this.game.height);
  }
}

export default WorldUpdaterFactory;
