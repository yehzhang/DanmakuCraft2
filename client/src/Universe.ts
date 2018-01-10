import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import UniverseProxy from './environment/interface/UniverseProxy';
import BootState from './BootState';
import Notifier from './render/notification/Notifier';
import Renderer from './render/Renderer';
import InputController from './controller/InputController';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import CommentLoader from './comment/CommentLoader';
import AdapterFactory from './environment/AdapterFactory';
import PhysicalConstants from './PhysicalConstants';
import BuffDataContainer from './comment/BuffDataContainer';
import {
  ChestEntity, CommentEntity, Player, Region,
  UpdatingCommentEntity
} from './entitySystem/alias';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import EntityFactory from './entitySystem/EntityFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
import Point from './util/syntax/Point';
import EntityStorageFactoryImpl from './util/entityStorage/EntityStorageFactoryImpl';
import EntityStorage from './util/entityStorage/EntityStorage';
import EntityStorageFactory from './util/entityStorage/EntityStorageFactory';
import {SettingsOptions} from './environment/interface/SettingsManager';
import GraphicsFactoryImpl from './render/graphics/GraphicsFactoryImpl';
import LawFactoryImpl from './law/LawFactoryImpl';
import LawFactory from './law/LawFactory';
import BuffDataApplier from './entitySystem/system/buff/BuffDataApplier';
import BuffDescription from './entitySystem/system/buff/BuffDescription';
import Debug from './util/Debug';
import UniverseProxyImpl from './environment/component/gameWorld/UniverseProxyImpl';
import NotifierFactoryImpl from './render/notification/NotifierFactoryImpl';
import TickCallbackRegister from './update/TickCallbackRegister';
import CommentLoaderImpl from './comment/CommentLoaderImpl';
import CommentPlacingPolicyImpl from './environment/component/gameWorld/CommentPlacingPolicyImpl';
import Updater from './update/Updater';
import {Phaser} from './util/alias/phaser';

/**
 * Instantiates and connects components. Starts the game.
 */
class Universe extends Phaser.State {
  public inputController: InputController;
  public renderer: Renderer;
  public commentLoader: CommentLoader;
  public commentsStorage: EntityStorage<CommentEntity, Region<CommentEntity>>;
  public notifier: Notifier;
  public buffDataContainer: BuffDataContainer;
  public player: Player;
  public buffFactory: BuffFactory;
  public randomDataGenerator: Phaser.RandomDataGenerator;
  public entityFactory: EntityFactory;
  public graphicsFactory: GraphicsFactory;
  public updatingCommentsStorage: EntityStorage<UpdatingCommentEntity, Region<UpdatingCommentEntity>>;
  public playersStorage: EntityStorage<Player>;
  public entityStorageFactory: EntityStorageFactory;
  public chestsStorage: EntityStorage<ChestEntity>;
  public lawFactory: LawFactory;
  public buffDataApplier: BuffDataApplier;
  public buffDescription: BuffDescription;
  public tickCallbackRegister: TickCallbackRegister;
  public commentPreviewStorage: EntityStorage<UpdatingCommentEntity>;
  public proxy: UniverseProxy;
  public previewCommentLoader: CommentLoader;
  public updater: Updater;

  private constructor(public game: Phaser.Game, public adapter: EnvironmentAdapter) {
    super();

    this.buffDataContainer = new BuffDataContainer();

    this.inputController = new InputController(game.input);

    this.lawFactory = new LawFactoryImpl();

    this.buffDescription = new BuffDescription();

    this.tickCallbackRegister = new TickCallbackRegister();

    this.buffFactory = new BuffFactoryImpl(game, this.inputController, this.lawFactory);

    this.randomDataGenerator = new Phaser.RandomDataGenerator([new Date()]);

    let settingsManager = adapter.getSettingsManager();
    this.graphicsFactory = new GraphicsFactoryImpl(
        game,
        this.randomDataGenerator,
        settingsManager.getSetting(SettingsOptions.FONT_FAMILY),
        settingsManager.getSetting(SettingsOptions.TEXT_SHADOW));

    this.entityFactory = new EntityFactoryImpl(game, this.graphicsFactory, this.buffFactory);

    this.entityStorageFactory = new EntityStorageFactoryImpl(this.entityFactory);
    this.commentsStorage =
        this.entityStorageFactory.createChunkEntityStorage(PhysicalConstants.COMMENT_CHUNKS_COUNT);
    this.updatingCommentsStorage =
        this.entityStorageFactory.createChunkEntityStorage(PhysicalConstants.UPDATING_COMMENT_CHUNKS_COUNT);
    this.playersStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.chestsStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.commentPreviewStorage = this.entityStorageFactory.createGlobalEntityStorage();

    this.player = this.entityFactory.createPlayer(Point.origin()); // TODO where to spawn?
    this.playersStorage.getRegister().register(this.player);

    let notifierFactory = new NotifierFactoryImpl(game, this.graphicsFactory);
    this.notifier = notifierFactory.createPoppingNotifier(this.player.display);

    this.renderer = new Renderer(game).turnOff();

    this.buffDataApplier =
        new BuffDataApplier(this.player, this.buffDataContainer, this.buffFactory);

    this.commentLoader = new CommentLoaderImpl(
        game,
        this.commentsStorage.getRegister(),
        this.updatingCommentsStorage.getRegister(),
        this.entityFactory,
        this.buffDataApplier);
    this.previewCommentLoader = new CommentLoaderImpl(
        game,
        this.commentPreviewStorage.getRegister(),
        this.commentPreviewStorage.getRegister(),
        this.entityFactory,
        this.buffDataApplier);

    this.updater = Updater.on(this);

    this.proxy = new UniverseProxyImpl(
        game,
        new CommentPlacingPolicyImpl(
            this.updater.collisionDetectionSystem,
            this.previewCommentLoader,
            this.notifier,
            this.buffDataContainer,
            this.player,
            this.updater.tickCallbackRegister),
        this.notifier);
  }

  static genesis(): void {
    if (hasGenesis) {
      throw new Error('The Universe has had its genesis');
    }

    hasGenesis = true;

    let adapterFactory = new AdapterFactory();
    let adapter = adapterFactory.createAdapter();
    let gameContainer = adapter.getGameContainerProvider().getContainerId();
    let game = new Phaser.Game('100', '100', Phaser.AUTO, gameContainer, null);

    game.state.add('BootState', new BootState(adapter, Universe.makeUniverse));
    game.state.start('BootState');
  }

  private static makeUniverse(game: Phaser.Game, adapter: EnvironmentAdapter) {
    let universe = new Universe(game, adapter);

    if (__STAGE__) {
      Debug.set(universe);
    }

    return universe;
  }

  preload() {
    if (__DEV__) {
      this.game.load.image('background', 'debug-grid-1920x1920.png');
    }
  }

  async create() {
    this.inputController.ignoreInput();

    this.renderer.turnOn().focus(this.player);

    if (__DEV__) {
      let sprite = this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
      this.game.world.sendToBack(sprite);
    }

    await this.renderer.fadeIn();

    this.inputController.receiveInput();
  }

  update() {
    this.updater.update();
  }

  render() {
    this.updater.render();
  }

  async loadComments(): Promise<void> {
    let commentProvider = this.adapter.getCommentProvider();
    let commentsData = await commentProvider.getAllComments();
    this.commentLoader.loadBatch(commentsData);

    commentProvider.connect();
    commentProvider.commentReceived.add(this.commentLoader.load, this.commentLoader);
  }

  getProxy(): UniverseProxy {
    return this.proxy;
  }
}

export default Universe;

let hasGenesis: boolean = false;

export type UniverseFactory = (game: Phaser.Game, adapter: EnvironmentAdapter) => Universe;
