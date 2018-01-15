import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import UniverseProxy from './environment/interface/UniverseProxy';
import BootState from './BootState';
import Notifier from './output/notification/Notifier';
import Renderer from './render/Renderer';
import InputController from './input/InputController';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import CommentLoader from './comment/CommentLoader';
import AdapterFactory from './environment/AdapterFactory';
import PhysicalConstants from './PhysicalConstants';
import BuffDataContainer from './entitySystem/system/buff/BuffDataContainer';
import {
  ChestEntity, CommentEntity, Player, Region, SignEntity,
  UpdatingCommentEntity
} from './entitySystem/alias';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import EntityFactory from './entitySystem/EntityFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
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
import NotifierFactoryImpl from './output/notification/NotifierFactoryImpl';
import CommentLoaderImpl from './comment/CommentLoaderImpl';
import CommentPlacingPolicyImpl from './environment/component/gameWorld/CommentPlacingPolicyImpl';
import Visibility from './engine/visibility/Visibility';
import {Phaser} from './util/alias/phaser';
import Existence from './engine/existence/Existence';
import DynamicProvider from './util/DynamicProvider';
import SystemFactoryImpl from './entitySystem/system/SystemFactoryImpl';
import Entity from './entitySystem/Entity';
import HardCodedPreset from './preset/HardCodedPreset';
import CommentData from './comment/CommentData';
import Provider from './util/syntax/Provider';

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
  public entityFactory: EntityFactory;
  public graphicsFactory: GraphicsFactory;
  public updatingCommentsStorage: EntityStorage<UpdatingCommentEntity, Region<UpdatingCommentEntity>>;
  public playersStorage: EntityStorage<Player>;
  public entityStorageFactory: EntityStorageFactory;
  public chestsStorage: EntityStorage<ChestEntity>;
  public lawFactory: LawFactory;
  public buffDataApplier: BuffDataApplier;
  public buffDescription: BuffDescription;
  public commentPreviewStorage: EntityStorage<UpdatingCommentEntity>;
  public proxy: UniverseProxy;
  public previewCommentLoader: CommentLoader;
  public visibility: Visibility;
  public existence: Existence;
  public isGameStarted: DynamicProvider<boolean>;
  public spawnPointsStorage: EntityStorage<Entity>;
  public signsStorage: EntityStorage<SignEntity>;

  private constructor(public game: Phaser.Game, public adapter: EnvironmentAdapter) {
    super();

    this.isGameStarted = new DynamicProvider(false);

    this.buffDataContainer = new BuffDataContainer();

    this.inputController = new InputController(game);

    this.lawFactory = new LawFactoryImpl();

    this.buffDescription = new BuffDescription();

    this.buffFactory = new BuffFactoryImpl(game, this.inputController, this.lawFactory);

    let randomDataGenerator = new Phaser.RandomDataGenerator([new Date()]);
    let settingsManager = adapter.getSettingsManager();
    this.graphicsFactory = new GraphicsFactoryImpl(
        game,
        randomDataGenerator,
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
    this.spawnPointsStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.signsStorage = this.entityStorageFactory.createGlobalEntityStorage();

    let preset = new HardCodedPreset(this.entityFactory, this.graphicsFactory);
    preset.populateSigns(this.signsStorage.getRegister());
    preset.populateSpawnPoints(
        this.spawnPointsStorage.getRegister(), this.signsStorage.getRegister());

    this.player = this.entityFactory.createPlayer(preset.getPlayerSpawnPoint());
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

    let systemFactory = new SystemFactoryImpl(
        this.game,
        this.lawFactory,
        this.player,
        this.buffDataApplier,
        this.buffDescription,
        this.notifier,
        this.entityFactory);
    this.visibility = Visibility.on(
        game,
        this.player,
        systemFactory,
        this.commentsStorage.getFinder(),
        this.updatingCommentsStorage.getFinder(),
        this.chestsStorage,
        this.playersStorage.getFinder(),
        this.commentPreviewStorage.getFinder(),
        this.spawnPointsStorage.getFinder(),
        this.signsStorage.getFinder(),
        this.renderer);
    this.existence = Existence.on(
        game,
        this.isGameStarted,
        this.commentsStorage.getFinder(),
        this.updatingCommentsStorage.getFinder());

    this.proxy = new UniverseProxyImpl(
        game,
        new CommentPlacingPolicyImpl(
            this.visibility.collisionDetectionSystem,
            this.previewCommentLoader,
            this.notifier,
            this.buffDataContainer,
            this.player,
            this.visibility.synchronizeUpdateSystem,
            this.visibility.synchronizeRenderSystem),
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

    this.isGameStarted.update(true);

    await this.renderer.fadeIn();

    this.inputController.receiveInput();
  }

  update() {
    this.existence.update(this.game.time);
    this.visibility.update(this.game.time);
  }

  render() {
    this.existence.render(this.game.time);
    this.visibility.render(this.game.time);
  }

  async loadComments(): Promise<() => void> {
    let commentProvider = this.adapter.getCommentProvider();
    let commentsDataProvider = await commentProvider.getAllComments();

    commentProvider.connect();
    commentProvider.commentReceived.add(data => this.commentLoader.load(data, true));

    return this.commentsLoader.bind(this, commentsDataProvider);
  }

  private commentsLoader(commentsDataProvider: Provider<CommentData[]>) {
    let commentsData = commentsDataProvider();
    this.commentLoader.loadBatch(commentsData);
  }

  getProxy(): UniverseProxy {
    return this.proxy;
  }
}

export default Universe;

let hasGenesis: boolean = false;

export type UniverseFactory = (game: Phaser.Game, adapter: EnvironmentAdapter) => Universe;
