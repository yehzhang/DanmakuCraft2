import EntityTracker from './entityTracker/EntityTracker';
import EntityProjector from './EntityProjector';
import {CommentEntity} from '../entity/comment';
import EntityManager from '../entity/EntityManager';
import {NonPlayerCharacter, Player} from '../entity/entity';
import {PhysicalConstants} from '../Universe';
import BackgroundColorManager from './BackgroundColorManager';
import NonPlayerCharacterTicker from './NonPlayerCharacterTicker';
import {Animated} from '../law';
import RenderingTarget from '../render/RenderTarget';

export default class WorldUpdater implements Animated {
  readonly entityRenderingTracker: EntityTracker<Player>;
  readonly backgroundColorTracker: EntityTracker;
  private renderingTargets: RenderingTarget[];

  constructor(
      private game: Phaser.Game,
      trackee: Player,
      private players: Player[],
      commentEntityManager: EntityManager<CommentEntity>,
      npcManager: EntityManager<NonPlayerCharacter>) {
    let commentEntityProjector = new EntityProjector<Player, CommentEntity>();
    let npcProjector = new EntityProjector<Player, NonPlayerCharacter>();
    this.entityRenderingTracker = EntityTracker
        .newBuilder(trackee, PhysicalConstants.getRenderRadius(game.width, game.height))
        .trackOnRegionChange(commentEntityManager, commentEntityProjector)
        .trackOnRegionChange(npcManager, npcProjector)
        .trackOnTick(npcManager, new NonPlayerCharacterTicker())
        .build();

    let backgroundColorManager = new BackgroundColorManager(game);
    this.backgroundColorTracker = EntityTracker
        .newBuilder(trackee, PhysicalConstants.BACKGROUND_SAMPLING_RADIUS)
        .trackOnRegionChange(commentEntityManager, backgroundColorManager)
        .build();

    this.renderingTargets = [
      new RenderingTarget(trackee, commentEntityProjector, 0),
      new RenderingTarget(trackee, npcProjector, 1),
    ];

    game.scale.onSizeChange.add(this.onGameResize, this);
  }

  tick(): void {
    this.entityRenderingTracker.tick();
    this.backgroundColorTracker.tick();
    for (let player of this.players) {
      player.tick();
    }
  }

  getRenderingTargets() {
    return this.renderingTargets.slice();
  }

  private onGameResize() {
    let samplingRadius = PhysicalConstants.getRenderRadius(this.game.width, this.game.height);
    this.entityRenderingTracker.updateSamplingRadius(samplingRadius);
  }
}
