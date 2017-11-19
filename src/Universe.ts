import EnvironmentAdapter from './environment/EnvironmentAdapter';
import UniverseProxy from './environment/UniverseProxy';
import {CommentEntity, CommentManager} from './entity/comment';
import {EntityManager} from './entity/entity';
import BootState from './BootState';
import {ChunkEntityManager} from './entity/chunk';
import {Notifier} from './notification';
import {LocallyOriginatedCommentEffectManager} from './effect';
import EntityProjector from './entity/EntityProjector';
import Background from './Background';
import {PlayerEntity} from './entity/player';
import EntityTracker from './entity/EntityTracker';

/**
 * Instantiates and connects components. Starts the game.
 */
export default class Universe {
  private static instance: Universe;

  private game: Phaser.Game;
  private commentManager: CommentManager;
  private commentEntityManager: EntityManager<CommentEntity>;
  private notifier: Notifier;
  private effectManager: LocallyOriginatedCommentEffectManager;
  private projector: EntityProjector;
  private player: PlayerEntity;

  private constructor(private adapter: EnvironmentAdapter) {
    this.game = new Phaser.Game(
        '100',
        '100',
        Phaser.AUTO,
        adapter.getGameContainerProvider().getContainer());
    this.commentEntityManager = new ChunkEntityManager(
        PhysicalConstants.CHUNKS_COUNT, PhysicalConstants.renderDistance);

    let settingsManager = adapter.getSettingsManager();
    this.commentManager = new CommentManager(this.game, this.commentEntityManager, settingsManager);

    this.notifier = new Notifier();
    this.effectManager = new LocallyOriginatedCommentEffectManager(1);
    this.player = new PlayerEntity(new Phaser.Point()); // TODO set actual spawn point
    this.projector = new EntityProjector([this.commentEntityManager], this.player);
  }

  static genesis(adapter: EnvironmentAdapter) {
    if (this.instance != null) {
      throw new Error('Universe is already started');
    }

    this.instance = new this(adapter);

    return this.instance;
  }

  static getGame() {
    if (this.instance == null) {
      throw new Error('Universe is not instantiated');
    }

    return this.instance.game;
  }

  start() {
    let commentProvider = this.adapter.getCommentProvider();

    this.game.state.add(BootState.name, new BootState(commentProvider, this.commentManager));

    this.game.state.start(BootState.name);
  }

  getProxy(): UniverseProxy {
    return new Proxy(this.commentManager, this.notifier, this.effectManager);
  }
}

// TODO add asserting test on validity of constants?
export class PhysicalConstants {
  public static readonly WORLD_SIZE = 1000; // TODO
  public static readonly CHUNKS_COUNT = 50;
  public static renderDistance = 1; // TODO change depending on Phaser.screenSize
}

class Proxy implements UniverseProxy {
  constructor(
      private commentManager: CommentManager,
      private notifier: Notifier,
      private effectManager: LocallyOriginatedCommentEffectManager) {
  }

  requestForPlacingComment(text: string, size: number): boolean {
    if (this.commentManager.canPlace(text, size)) {
      return true;
    }

    // TODO
    throw new Error('Not implemented');
    // this.notifier.notify('');
    //
    // return false;
  }

  getPlayer(): PlayerEntity {
    throw new Error('Method not implemented.');
  }

  getEffectManager(): LocallyOriginatedCommentEffectManager {
    return this.effectManager;
  }
}
