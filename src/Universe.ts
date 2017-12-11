import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import UniverseProxy from './environment/interface/UniverseProxy';
import EntityFinder from './util/entityFinder/EntityFinder';
import BootState from './BootState';
import Notifier from './render/notification/Notifier';
import WorldUpdater from './update/WorldUpdater';
import Renderer from './render/Renderer';
import Colors from './render/Colors';
import InputController from './controller/InputController';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import {UuidGenerator} from './util/IdGenerator';
import CommentManager from './comment/CommentManager';
import AdapterFactory from './environment/AdapterFactory';
import {ChunkEntityFinder} from './util/entityFinder/ChunkFinder';
import PhysicalConstants from './PhysicalConstants';
import LocallyOriginatedCommentBuffContainer from './comment/LocallyOriginatedCommentBuffContainer';
import {CommentEntity, Player, UpdatingCommentEntity} from './entitySystem/alias';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import EntityFactory from './entitySystem/EntityFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
import Point from './util/Point';
import GlobalEntityFinder from './util/entityFinder/GlobalEntityFinder';

/**
 * Instantiates and connects components. Starts the game.
 */
export default class Universe extends Phaser.State {
  private inputController: InputController;
  private renderer: Renderer;
  private updater: WorldUpdater;
  private commentManager: CommentManager;
  private commentEntityFinder: EntityFinder<CommentEntity>;
  private notifier: Notifier;
  private buffManager: LocallyOriginatedCommentBuffContainer;
  private player: Player;
  private buffFactory: BuffFactory;
  private idGenerator: UuidGenerator;
  private entityFactory: EntityFactory;
  private graphicsFactory: GraphicsFactory;
  private updatingCommentEntityFinder: ChunkEntityFinder<UpdatingCommentEntity>;
  private playersFinder: GlobalEntityFinder<Player>;

  private constructor(game: Phaser.Game, private adapter: EnvironmentAdapter) {
    super();

    this.notifier = new Notifier();
    this.buffManager = new LocallyOriginatedCommentBuffContainer(1);

    let settingsManager = adapter.getSettingsManager();
    this.inputController = new InputController(game).ignoreInput();
    this.buffFactory = new BuffFactoryImpl(game, this.inputController);
    this.idGenerator = new UuidGenerator();
    this.graphicsFactory = new GraphicsFactory(game, this.idGenerator, settingsManager);
    this.entityFactory = new EntityFactoryImpl(game, this.graphicsFactory, this.buffFactory);
    this.player = this.entityFactory.createPlayer(Point.origin()); // TODO

    this.commentEntityFinder =
        new ChunkEntityFinder(PhysicalConstants.COMMENT_CHUNKS_COUNT, this.entityFactory);
    this.updatingCommentEntityFinder =
        new ChunkEntityFinder(PhysicalConstants.UPDATING_CHUNKS_COUNT, this.entityFactory);
    this.playersFinder = new GlobalEntityFinder(this.entityFactory);
    this.updater = new WorldUpdater(
        game,
        this.player,
        this.playersFinder,
        this.commentEntityFinder,
        this.updatingCommentEntityFinder);
    this.renderer = new Renderer(game, this.updater.getRenderingTargets()).turnOff();
    this.commentManager = new CommentManager(
        this.commentEntityFinder, this.updater.foregroundTracker, this.entityFactory);
  }

  static genesis(): void {
    if (hasGenesis) {
      throw new Error('The Universe has had its genesis');
    }

    hasGenesis = true;

    let adapterFactory = new AdapterFactory();
    let adapter = adapterFactory.createAdapter();
    let gameContainer = adapter.getGameContainerProvider().getContainerId();
    let game = new Phaser.Game('100', '100', Phaser.AUTO, gameContainer, null, false, false);

    game.state.add('BootState', new BootState(adapter, Universe.makeUniverse));
    game.state.start('BootState');
  }

  private static makeUniverse(game: Phaser.Game, adapter: EnvironmentAdapter) {
    return new Universe(game, adapter);
  }

  async loadComments(): Promise<void> {
    let commentProvider = this.adapter.getCommentProvider();
    let commentsData = await commentProvider.getAllComments();
    this.commentManager.loadBatch(commentsData);

    commentProvider.connect();
    this.commentManager.listenTo(commentProvider);
  }

  preload() {
    if (__DEBUG__) {
      this.game.load.image('background', 'debug-grid-1920x1920.png');
    }
  }

  create() {
    if (__DEBUG__) {
      this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
    }

    this.renderer.turnOn().focusOn(this.player);

    this.inputController.receiveInput();
  }

  update() {
    this.updater.tick();
  }

  getProxy(): UniverseProxy {
    return new Proxy(this.commentManager, this.graphicsFactory, this.notifier, this.buffManager);
  }
}

let hasGenesis: boolean = false;

export type UniverseFactory = (game: Phaser.Game, adapter: EnvironmentAdapter) => Universe;

class Proxy implements UniverseProxy {
  constructor(
      private commentManager: CommentManager,
      private graphicsFactory: GraphicsFactory,
      private notifier: Notifier,
      private buffManager: LocallyOriginatedCommentBuffContainer) {
  }

  requestForPlacingComment(text: string, size: number): boolean {
    let newComment = this.graphicsFactory.createText(text, size, Colors.WHITE);
    if (this.commentManager.canPlaceCommentIn(newComment.textBounds)) {

      return true;
    }

    // TODO
    throw new Error('Not implemented');
    // this.notifier.notify('');
    //
    // return false;
  }

  getPlayer(): Player {
    throw new Error('Method not implemented.');
  }

  getBuffContainer() {
    return this.buffManager;
  }
}
