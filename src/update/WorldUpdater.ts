import EntityTracker from './entityTracker/EntityTracker';
import EntityProjector from './EntityProjector';
import {CommentEntity} from '../entity/comment';
import EntityManager from '../entity/EntityManager';
import {NonPlayerCharacter, Observer, Player} from '../entity/entity';
import {PhysicalConstants} from '../Universe';
import BackgroundColorManager from './BackgroundColorManager';
import NonPlayerCharacterTicker from './NonPlayerCharacterTicker';
import {Animated} from '../law';

export default class WorldUpdater implements Animated {
  readonly entityRenderingTracker: EntityTracker<Player>;
  readonly backgroundColorTracker: EntityTracker;
  private renderingTargets: RenderingTarget[];

  constructor(
      private game: Phaser.Game,
      player: Player,
      commentEntityManager: EntityManager<CommentEntity>,
      npcManager: EntityManager<NonPlayerCharacter>) {
    let commentEntityProjector = new EntityProjector<Player, CommentEntity>();
    let npcProjector = new EntityProjector<Player, NonPlayerCharacter>();
    this.entityRenderingTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.getRenderRadius(game.width, game.height))
        .trackOnRegionChange(commentEntityManager, commentEntityProjector)
        .trackOnRegionChange(npcManager, npcProjector)
        .trackOnTick(npcManager, new NonPlayerCharacterTicker())
        .build();

    let backgroundColorManager = new BackgroundColorManager(game);
    this.backgroundColorTracker = EntityTracker
        .newBuilder(player, PhysicalConstants.BACKGROUND_SAMPLING_RADIUS)
        .trackOnRegionChange(commentEntityManager, backgroundColorManager)
        .build();

    this.renderingTargets = [
      new RenderingTarget(player, commentEntityProjector, 0),
      new RenderingTarget(player, npcProjector, 1),
    ];

    game.scale.onSizeChange.add(this.onGameResize, this);
  }

  tick(): void {
    this.entityRenderingTracker.tick();
    this.backgroundColorTracker.tick();
  }

  getRenderingTargets() {
    return this.renderingTargets.slice();
  }

  private onGameResize() {
    let samplingRadius = PhysicalConstants.getRenderRadius(this.game.width, this.game.height);
    this.entityRenderingTracker.updateSamplingRadius(samplingRadius);
  }
}

export class RenderingTarget {
  private static zIndices = new Set();

  constructor(
      readonly observer: Observer,
      readonly projector: EntityProjector,
      readonly zIndex: number) {
    if (RenderingTarget.zIndices.has(zIndex)) {
      throw new Error('zIndex must be unique');
    }
    RenderingTarget.zIndices.add(zIndex);
  }
}
