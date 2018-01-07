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
import CollisionDetectionSystem from './entitySystem/system/existence/CollisionDetectionSystem';
import {SettingsOptions} from './environment/interface/SettingsManager';
import GraphicsFactoryImpl from './render/graphics/GraphicsFactoryImpl';
import LawFactoryImpl from './law/LawFactoryImpl';
import LawFactory from './law/LawFactory';
import BuffDataApplier from './entitySystem/system/buff/BuffDataApplier';
import DynamicProvider from './util/DynamicProvider';
import DisplayMoveSystem from './entitySystem/system/tick/DisplayPositionSystem';
import SuperposedEntityRenderSystem from './entitySystem/system/existence/SuperposedEntityRenderSystem';
import ChestSystem, {
  ChestDemolisher, ChestOpener,
  ChestSpawner
} from './entitySystem/system/ChestSystem';
import EntityTracker from './update/EntityTracker';
import UpdateSystem from './entitySystem/system/tick/UpdateSystem';
import RegionRenderSystem from './entitySystem/system/existence/RegionRenderSystem';
import BackgroundColorSystem from './entitySystem/system/existence/BackgroundColorSystem';
import MovingAnimationSystem from './entitySystem/system/tick/MovingAnimationSystem';
import BuffDescription from './entitySystem/system/buff/BuffDescription';
import AddToContainerSystem from './entitySystem/system/existence/AddToContainerSystem';
import Debug from './util/Debug';
import UniverseProxyImpl from './UniverseProxyImpl';
import NotifierFactoryImpl from './render/notification/NotifierFactoryImpl';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

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
  public collisionDetectionSystem: CollisionDetectionSystem;
  public chestsStorage: EntityStorage<ChestEntity>;
  public lawFactory: LawFactory;
  public buffDataApplier: BuffDataApplier;
  public buffDescription: BuffDescription;
  public foregroundTracker: EntityTracker;
  public backgroundTracker: EntityTracker;
  public chestSystem: ChestSystem;

  private constructor(public game: Phaser.Game, public adapter: EnvironmentAdapter) {
    super();

    this.buffDataContainer = new BuffDataContainer();

    this.inputController = new InputController(game).ignoreInput();

    this.lawFactory = new LawFactoryImpl();

    this.buffDescription = new BuffDescription();

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
    // TODO optimize: tree storage?
    this.playersStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.chestsStorage = this.entityStorageFactory.createGlobalEntityStorage();

    this.player = this.entityFactory.createPlayer(Point.origin()); // TODO where to spawn?
    this.playersStorage.getRegister().register(this.player);

    let notifierFactory = new NotifierFactoryImpl(game, this.graphicsFactory);
    this.notifier = notifierFactory.createPoppingNotifier(this.player.display);

    this.renderer = new Renderer(game).turnOff();

    this.buffDataApplier =
        new BuffDataApplier(this.player, this.buffDataContainer, this.buffFactory);

    this.commentLoader = new CommentLoader(
        game,
        this.commentsStorage.getRegister(),
        this.updatingCommentsStorage.getRegister(),
        this.entityFactory,
        this.buffDataApplier);

    this.setupUpdatingRules();
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

    if (__DEBUG__) {
      Debug.set(universe);
    }

    return universe;
  }

  create() {
    if (__DEBUG__) {
      this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
    }

    this.renderer.turnOn().focus(this.player);

    this.inputController.receiveInput();
  }

  update() {
    this.foregroundTracker.tick(this.game.time);
    this.backgroundTracker.tick(this.game.time);
  }

  async loadComments(): Promise<void> {
    let commentProvider = this.adapter.getCommentProvider();
    let commentsData = await commentProvider.getAllComments();
    this.commentLoader.loadBatch(commentsData);

    commentProvider.connect();
    commentProvider.commentReceived.add(this.commentLoader.load, this.commentLoader);
  }

  preload() {
    if (__DEBUG__) {
      this.game.load.image('background', 'debug-grid-1920x1920.png');
    }
  }

  getProxy(): UniverseProxy {
    return new UniverseProxyImpl(
        this.collisionDetectionSystem,
        this.graphicsFactory,
        this.notifier,
        this.buffDataContainer);
  }

  private setupUpdatingRules() {
    let renderRadius = new DynamicProvider(this.getRenderRadius());
    this.game.scale.onSizeChange.add(() => renderRadius.update(this.getRenderRadius()));

    let chestLaw =
        this.lawFactory.createChestLaw(this.player, renderRadius, __DEBUG__ ? 1 : undefined);
    this.chestSystem = new ChestSystem(
        new ChestOpener(
            this.game,
            this.player,
            this.buffDataApplier,
            chestLaw,
            this.notifier,
            this.buffDescription),
        new ChestSpawner(
            this.chestsStorage.getRegister(),
            this.entityFactory,
            chestLaw),
        new ChestDemolisher(this.chestsStorage.getRegister()));

    this.collisionDetectionSystem = new CollisionDetectionSystem();

    let stage = this.renderer.getStage();

    let commentsFinder = this.commentsStorage.getFinder();
    let updatingCommentsFinder = this.updatingCommentsStorage.getFinder();
    let chestsFinder = this.chestsStorage.getFinder();
    let playersFinder = this.playersStorage.getFinder();

    // TODO split render related systems to another tracker called in State.render()?
    this.foregroundTracker = EntityTracker.newBuilder(this.player, renderRadius)

        .applyExistenceSystem(new SuperposedEntityRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)
        .toLiftedEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new RegionRenderSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(new AddToContainerSystem(this.player, stage))
        .toEntities().of(chestsFinder)

        .applyExistenceSystem(new AddToContainerSystem(this.player, stage, this.game.make.group()))
        .toEntities().of(playersFinder)

        .applyExistenceSystem(new AddToContainerSystem(this.player, stage))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(this.collisionDetectionSystem)
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .applyExistenceSystem(this.chestSystem).toEntities().of(chestsFinder)

        .applyTickSystem(new UpdateSystem(this.game.time))
        .toEntities().of(playersFinder)
        .toLiftedEntities().of(updatingCommentsFinder)

        .applyTickSystem(new DisplayMoveSystem()).toEntities().of(playersFinder)

        .applyTickSystem(new MovingAnimationSystem()).toEntities().of(playersFinder)

        .applyTickSystem(this.chestSystem).toEntities().of(chestsFinder)

        .build();

    this.backgroundTracker = EntityTracker
        .newBuilder(this.player, new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS))

        .applyExistenceSystem(new BackgroundColorSystem(this.game))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();
  }

  private getRenderRadius() {
    return PhysicalConstants.getRenderRadius(this.game.width, this.game.height);
  }
}

export default Universe;

let hasGenesis: boolean = false;

export type UniverseFactory = (game: Phaser.Game, adapter: EnvironmentAdapter) => Universe;
