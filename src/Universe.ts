import {EnvironmentAdapter} from './environment/inwardAdapter';
import {UniverseProxy} from './environment/outwardAdapter';
import {CommentManager} from './comment';
import {EntityManager} from './entity';
import {BootState, EndState} from './state';
import {ChunkEntityManager} from './chunk';
import {Notifier} from './notification';

/**
 * Instantiates and connects components. Starts the game.
 */
export default class Universe {
  private game: Phaser.Game;
  private commentManager: CommentManager;
  private entityManager: EntityManager;
  private notifier: Notifier;

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
    this.commentManager = new CommentManager(this.entityManager);
    this.notifier = new Notifier();
  }

  genesis() {
    this.game.state.add(BootState.name, new BootState(this.adapter, this.commentManager));
    this.game.state.add(EndState.name, new EndState());

    this.game.state.start(BootState.name);
  }

  getProxy(): UniverseProxy {
    return new Proxy(this.commentManager, this.notifier);
  }
}

class PhysicalConstants {
  public static readonly WORLD_SIZE = 1000; // TODO
  public static readonly CHUNKS_COUNT = 50;
  public static renderDistance = 1000; // TODO change depending on Phaser.screenSize
}

class Proxy implements UniverseProxy {
  constructor(
      private commentManager: CommentManager,
      private notifier: Notifier) {
  }

  requestForPlacingComment(text: string, size: number): boolean {
    if (this.commentManager.canPlaceComment(text, size)) {
      return true;
    }

    // TODO
    throw new Error('Not implemented');
    // this.notifier.notify('');
    //
    // return false;
  }

  getPlayer() {
    throw new Error('Method not implemented.');
  }
}
