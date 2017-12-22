import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import UniverseProxy from './environment/interface/UniverseProxy';
import BootState from './BootState';
import Notifier from './render/notification/Notifier';
import WorldUpdater from './update/WorldUpdater';
import Renderer from './render/Renderer';
import Colors from './render/Colors';
import InputController from './controller/InputController';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import {UuidGenerator} from './util/IdGenerator';
import CommentLoader from './comment/CommentLoader';
import AdapterFactory from './environment/AdapterFactory';
import PhysicalConstants from './PhysicalConstants';
import LocallyOriginatedCommentBuffContainer from './comment/LocallyOriginatedCommentBuffContainer';
import {CommentEntity, Player, Region, UpdatingCommentEntity} from './entitySystem/alias';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import EntityFactory from './entitySystem/EntityFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
import Point from './util/syntax/Point';
import RenderingTarget from './render/RenderTarget';
import WorldUpdaterFactory from './update/WorldUpdaterFactory';
import EntityStorageFactoryImpl from './util/entityStorage/EntityStorageFactoryImpl';
import EntityStorage from './util/entityStorage/EntityStorage';
import EntityStorageFactory from './util/entityStorage/EntityStorageFactory';
import CollisionDetectionSystem from './entitySystem/system/existence/CollisionDetectionSystem';

/**
 * Instantiates and connects components. Starts the game.
 */
class Universe extends Phaser.State {
  private inputController: InputController;
  private renderer: Renderer;
  private updater: WorldUpdater;
  private commentLoader: CommentLoader;
  private commentsStorage: EntityStorage<CommentEntity, Region<CommentEntity>>;
  private notifier: Notifier;
  private buffManager: LocallyOriginatedCommentBuffContainer;
  private player: Player;
  private buffFactory: BuffFactory;
  private idGenerator: UuidGenerator;
  private entityFactory: EntityFactory;
  private graphicsFactory: GraphicsFactory;
  private updatingCommentsStorage: EntityStorage<UpdatingCommentEntity, Region<UpdatingCommentEntity>>;
  private playersStorage: EntityStorage<Player>;
  private entityStorageFactory: EntityStorageFactory;
  private collisionDetectionSystem: CollisionDetectionSystem;

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
    this.collisionDetectionSystem = new CollisionDetectionSystem(new Set());

    this.entityStorageFactory = new EntityStorageFactoryImpl(this.entityFactory);
    this.commentsStorage =
        this.entityStorageFactory.createChunkEntityStorage(PhysicalConstants.COMMENT_CHUNKS_COUNT);
    this.updatingCommentsStorage =
        this.entityStorageFactory.createChunkEntityStorage(PhysicalConstants.UPDATING_CHUNKS_COUNT);
    // TODO optimize: tree storage?
    this.playersStorage = this.entityStorageFactory.createGlobalEntityStorage();

    this.player = this.entityFactory.createPlayer(Point.origin()); // TODO
    this.playersStorage.getRegister().register(this.player);

    let worldUpdaterFactory = new WorldUpdaterFactory(game);
    let observedDisplay = new PIXI.DisplayObjectContainer();
    this.updater = worldUpdaterFactory.createWorldUpdater(
        this.player,
        observedDisplay,
        this.collisionDetectionSystem,
        this.playersStorage.getFinder(),
        this.commentsStorage.getFinder(),
        this.updatingCommentsStorage.getFinder());

    let renderingTargets = [
      new RenderingTarget(this.player, observedDisplay, 0),
    ];
    this.renderer = new Renderer(game, renderingTargets).turnOff();
    this.commentLoader = new CommentLoader(this.commentsStorage.getRegister(), this.entityFactory);
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
    this.commentLoader.loadBatch(commentsData);

    commentProvider.connect();
    this.commentLoader.listenTo(commentProvider);
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
    return new Proxy(
        this.collisionDetectionSystem,
        this.graphicsFactory,
        this.notifier,
        this.buffManager);
  }
}

let hasGenesis: boolean = false;

export type UniverseFactory = (game: Phaser.Game, adapter: EnvironmentAdapter) => Universe;

export default Universe;

class Proxy implements UniverseProxy {
  constructor(
      private collisionDetectionSystem: CollisionDetectionSystem,
      private graphicsFactory: GraphicsFactory,
      private notifier: Notifier,
      private buffManager: LocallyOriginatedCommentBuffContainer) {
  }

  requestForPlacingComment(text: string, size: number): boolean {
    let newComment = this.graphicsFactory.createText(text, size, Colors.WHITE);
    if (!this.collisionDetectionSystem.collidesWith(newComment)) {
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
