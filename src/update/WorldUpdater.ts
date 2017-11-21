import EntityTracker from './entityTracker/EntityTracker';
import EntityProjector from './EntityProjector';
import {CommentEntity} from '../entity/comment';
import EntityManager from '../entity/EntityManager';
import {NonPlayerCharacter, Player} from '../entity/entity';
import {PhysicalConstants} from '../Universe';
import BackgroundColorManager from './BackgroundColorManager';
import NonPlayerCharacterTicker from './NonPlayerCharacterTicker';
import {Animated} from '../law';

export default class WorldUpdater implements Animated {
  readonly entityRenderingTracker: EntityTracker;
  readonly backgroundColorTracker: EntityTracker;

  constructor(
      game: Phaser.Game,
      player: Player,
      entityProjector: EntityProjector,
      backgroundColorManager: BackgroundColorManager,
      commentEntityManager: EntityManager<CommentEntity>,
      npcManager: EntityManager<NonPlayerCharacter>) {
    this.entityRenderingTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.getRenderRadius(game.width, game.height))
        .trackOnRegionChange(commentEntityManager, entityProjector)
        .trackOnRegionChange(npcManager, entityProjector)
        .trackOnTick(npcManager, new NonPlayerCharacterTicker())
        .build();
    this.backgroundColorTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.BACKGROUND_SAMPLING_RADIUS)
        .trackOnRegionChange(commentEntityManager, backgroundColorManager)
        .build();

    game.scale.onSizeChange.add(this.onGameResize, this);
  }

  tick(): void {
    this.entityRenderingTracker.tick();
    this.backgroundColorTracker.tick();
  }

  private onGameResize(gameWidth: number, gameHeight: number) {
    let samplingRadius = PhysicalConstants.getRenderRadius(gameWidth, gameHeight);
    this.entityRenderingTracker.updateSamplingRadius(samplingRadius);
  }
}
