import {EnvironmentAdapter} from './environment/inwardAdapter';
import {UniverseProxy} from './environment/outwardAdapter';
import {CommentEntityManager} from './comment';
import {EntityManager} from './entity';
import {BootState, EndState} from './state';
import {ChunkEntityManager} from './chunk';

/**
 * Instantiates and connects components. Starts the game.
 */
export default class Universe {
  private game: Phaser.Game;
  private commentManager: CommentEntityManager;
  private entityManager: EntityManager;

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
    this.commentManager = new CommentEntityManager(this.entityManager);
  }

  genesis() {
    this.game.state.add(BootState.name, new BootState(this.adapter, this.commentManager));
    this.game.state.add(EndState.name, new EndState());

    this.game.state.start(BootState.name);
  }

  getProxy(): UniverseProxy {
    // TODO
    throw new Error('Not implemented');
  }
}

class PhysicalConstants {
  public static readonly WORLD_SIZE = 1000; // TODO
  public static readonly CHUNKS_COUNT = 50;
  public static renderDistance = 1000; // TODO change depending on Phaser.screenSize
}
