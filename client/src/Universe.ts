import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import UniverseProxy from './environment/interface/UniverseProxy';
import MainState from './MainState';
import Notifier from './output/notification/Notifier';
import Renderer from './render/Renderer';
import InputController from './input/InputController';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import CommentLoader from './comment/CommentLoader';
import AdapterFactory from './environment/AdapterFactory';
import BuffDataContainer from './entitySystem/system/buff/BuffDataContainer';
import {
  ChestEntity,
  CommentEntity,
  Player,
  Region,
  SignEntity,
  UpdatingCommentEntity
} from './entitySystem/alias';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import EntityFactory from './entitySystem/EntityFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
import EntityStorageFactoryImpl from './util/entityStorage/EntityStorageFactoryImpl';
import EntityStorage from './util/entityStorage/EntityStorage';
import EntityStorageFactory from './util/entityStorage/EntityStorageFactory';
import {PresetSettingsOptions} from './environment/interface/SettingsManager';
import GraphicsFactoryImpl from './render/graphics/GraphicsFactoryImpl';
import LawFactoryImpl from './law/LawFactoryImpl';
import LawFactory from './law/LawFactory';
import BuffDataApplier from './entitySystem/system/buff/BuffDataApplier';
import BuffDescription from './entitySystem/system/buff/BuffDescription';
import UniverseProxyImpl from './environment/component/gameWorld/UniverseProxyImpl';
import NotifierFactoryImpl from './output/notification/NotifierFactoryImpl';
import CommentLoaderImpl from './comment/CommentLoaderImpl';
import CommentPlacingPolicyImpl from './environment/component/gameWorld/CommentPlacingPolicyImpl';
import Visibility from './engine/visibility/Visibility';
import {Phaser} from './util/alias/phaser';
import Existence from './engine/existence/Existence';
import SystemFactoryImpl from './entitySystem/system/SystemFactoryImpl';
import Entity from './entitySystem/Entity';
import HardCodedPreset from './preset/HardCodedPreset';
import CommentPlacingPolicy from './environment/interface/CommentPlacingPolicy';
import EngineCap from './engine/EngineCap';
import SystemEnginesEngine from './engine/SystemEnginesEngine';
import Tick from './engine/tick/Tick';
import PhaserInput from './input/PhaserInput';

/**
 * Instantiates and connects components. Starts the game.
 */
class Universe {
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
  public proxy: UniverseProxy;
  public visibility: Visibility;
  public existence: Existence;
  public spawnPointsStorage: EntityStorage<Entity>;
  public signsStorage: EntityStorage<SignEntity>;
  public commentPlacingPolicy: CommentPlacingPolicy;
  public tick: Tick;
  public engineCap: EngineCap;
  public input: PhaserInput;

  private constructor(public game: Phaser.Game, public adapter: EnvironmentAdapter) {
    this.buffDataContainer = new BuffDataContainer();

    this.input = new PhaserInput(game);
    this.inputController = new InputController(game, this.input).ignoreInput();

    this.lawFactory = new LawFactoryImpl();

    this.buffDescription = new BuffDescription();

    this.buffFactory = new BuffFactoryImpl(game, this.inputController, this.lawFactory);

    const randomDataGenerator = new Phaser.RandomDataGenerator([new Date()]);
    const settingsManager = adapter.getSettingsManager();
    this.graphicsFactory = new GraphicsFactoryImpl(
        game,
        randomDataGenerator,
        settingsManager.getSetting(PresetSettingsOptions.FONT_FAMILY),
        settingsManager.getSetting(PresetSettingsOptions.TEXT_SHADOW));

    this.entityFactory = new EntityFactoryImpl(game, this.graphicsFactory, this.buffFactory);

    this.entityStorageFactory = new EntityStorageFactoryImpl(this.entityFactory);
    this.commentsStorage = this.entityStorageFactory.createQuadtreeEntityStorage();
    this.updatingCommentsStorage = this.entityStorageFactory.createQuadtreeEntityStorage();
    this.playersStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.chestsStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.spawnPointsStorage = this.entityStorageFactory.createGlobalEntityStorage();
    this.signsStorage = this.entityStorageFactory.createGlobalEntityStorage();

    const preset = new HardCodedPreset(this.entityFactory, this.graphicsFactory);
    preset.populateSigns(this.signsStorage.getRegister());
    preset.populateSpawnPoints(
        this.spawnPointsStorage.getRegister(), this.signsStorage.getRegister());

    this.player = this.entityFactory.createPlayer(preset.getPlayerSpawnPoint());
    this.playersStorage.getRegister().register(this.player);

    const notifierFactory = new NotifierFactoryImpl(game, this.graphicsFactory);
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

    const systemFactory = new SystemFactoryImpl(
        this.game,
        this.lawFactory,
        this.player,
        this.buffDataApplier,
        this.buffDescription,
        this.notifier,
        this.entityFactory,
        settingsManager,
        this.input);
    this.visibility = Visibility.on(
        game,
        this.player,
        systemFactory,
        this.commentsStorage.getFinder(),
        this.updatingCommentsStorage.getFinder(),
        this.chestsStorage,
        this.playersStorage.getFinder(),
        this.spawnPointsStorage.getFinder(),
        this.signsStorage.getFinder(),
        this.renderer);
    this.existence = Existence.on(
        game,
        this.commentsStorage.getFinder(),
        this.updatingCommentsStorage.getFinder());
    this.tick = Tick.on(this.player, this.visibility.chestSystem, systemFactory);
    this.engineCap = new EngineCap(
        new SystemEnginesEngine([
          this.existence,
          this.tick.beforeVisibility,
          this.visibility,
          this.tick.afterVisibility]),
        this.game.time);

    this.commentPlacingPolicy = new CommentPlacingPolicyImpl(
        this.visibility.collisionDetectionSystem,
        this.graphicsFactory,
        this.notifier,
        this.buffDataContainer,
        this.player,
        this.renderer.fixedToCameraLayer);
    this.proxy = new UniverseProxyImpl(game, this.commentPlacingPolicy, this.notifier);
  }

  static genesis(): void {
    if (hasGenesis) {
      throw new Error('The Universe has had its genesis');
    }

    hasGenesis = true;

    const adapterFactory = new AdapterFactory();
    const adapter = adapterFactory.createAdapter();
    const gameContainer = adapter.getGameContainerProvider().getContainerId();
    const game = new Phaser.Game(0, 0, Phaser.AUTO, gameContainer, null);

    game.state.add('MainState', new MainState(() => {
      const universe = new Universe(game, adapter);

      const proxy = universe.getProxy();
      adapter.setProxy(proxy);

      return universe;
    }));
    game.state.start('MainState');
  }

  onTransitionScreenAllWhite() {
    this.renderer.turnOn().focus(this.player);
  }

  onTransitionFinished() {
    this.inputController.receiveInput();
    this.tick.tutorialSystem.start();
  }

  getProxy(): UniverseProxy {
    return this.proxy;
  }
}

export default Universe;

let hasGenesis = false;
