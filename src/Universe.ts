import EnvironmentAdapter from './environment/EnvironmentAdapter';
import UniverseProxy from './environment/UniverseProxy';
import {CommentManager} from './comment';
import {EntityManager, PlayerEntity} from './entity';
import BootState from './BootState';
import {ChunkEntityManager} from './chunk';
import {Notifier} from './notification';
import {LocallyOriginatedCommentEffectManager} from './effect';

/**
 * Instantiates and connects components. Starts the game.
 */
export default class Universe {
  private game: Phaser.Game;
  private commentManager: CommentManager;
  private entityManager: EntityManager;
  private notifier: Notifier;
  private effectManager: LocallyOriginatedCommentEffectManager;

  constructor(private adapter: EnvironmentAdapter) {
    this.game = new Phaser.Game(
        '100',
        '100',
        Phaser.AUTO,
        adapter.getGameContainerProvider().getContainer());
    this.entityManager = new ChunkEntityManager(
        PhysicalConstants.WORLD_SIZE,
        PhysicalConstants.CHUNKS_COUNT,
        PhysicalConstants.renderDistance);

    let settingsManager = adapter.getSettingsManager();
    this.commentManager = new CommentManager(this.game, this.entityManager, settingsManager);

    this.notifier = new Notifier();
    this.effectManager = new LocallyOriginatedCommentEffectManager(1);
  }

  genesis() {
    let commentProvider = this.adapter.getCommentProvider();

    this.game.state.add(BootState.name, new BootState(commentProvider, this.commentManager));

    this.game.state.start(BootState.name);
  }

  getProxy(): UniverseProxy {
    return new Proxy(this.commentManager, this.notifier, this.effectManager);
  }
}

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
