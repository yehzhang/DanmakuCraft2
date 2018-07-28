import CommentLoader from './comment/CommentLoader';
import CommentLoaderImpl from './comment/CommentLoaderImpl';
import EngineCap from './engine/EngineCap';
import Existence from './engine/existence/Existence';
import SystemEnginesEngine from './engine/SystemEnginesEngine';
import Tick from './engine/tick/Tick';
import Visibility from './engine/visibility/Visibility';
import {ChestEntity, CommentEntity, Player, SignEntity, UpdatingCommentEntity} from './entitySystem/alias';
import Entity from './entitySystem/Entity';
import EntityFactory from './entitySystem/EntityFactory';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
import BuffDataApplier from './entitySystem/system/buff/BuffDataApplier';
import BuffDataContainer from './entitySystem/system/buff/BuffDataContainer';
import BuffDescription from './entitySystem/system/buff/BuffDescription';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import SystemFactoryImpl from './entitySystem/system/SystemFactoryImpl';
import AdapterFactory from './environment/AdapterFactory';
import CommentPlacingPolicyImpl from './environment/component/gameWorld/CommentPlacingPolicyImpl';
import UniverseProxyImpl from './environment/component/gameWorld/UniverseProxyImpl';
import CommentPlacingPolicy from './environment/interface/CommentPlacingPolicy';
import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import {PresetSettingsOptions} from './environment/interface/SettingsManager';
import UniverseProxy from './environment/interface/UniverseProxy';
import InputController from './input/InputController';
import PhaserInput from './input/PhaserInput';
import LawFactory from './law/LawFactory';
import LawFactoryImpl from './law/LawFactoryImpl';
import MainState from './MainState';
import BackgroundMusicPlayer from './output/audio/BackgroundMusicPlayer';
import BackgroundMusicPlayerImpl from './output/audio/BackgroundMusicPlayerImpl';
import Notifier from './output/notification/Notifier';
import NotifierFactoryImpl from './output/notification/NotifierFactoryImpl';
import HardCodedPreset from './preset/HardCodedPreset';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import GraphicsFactoryImpl from './render/graphics/GraphicsFactoryImpl';
import Renderer from './render/Renderer';
import {Phaser} from './util/alias/phaser';
import EntityStorage from './util/entityStorage/EntityStorage';
import EntityStorageFactory from './util/entityStorage/EntityStorageFactory';
import EntityStorageFactoryImpl from './util/entityStorage/EntityStorageFactoryImpl';

/**
 * Instantiates and connects components. Starts the game.
 */
class Universe {
  public inputController: InputController;
  public renderer: Renderer;
  public commentLoader: CommentLoader;
  public commentsStorage: EntityStorage<CommentEntity>;
  public notifier: Notifier;
  public buffDataContainer: BuffDataContainer;
  public player: Player;
  public buffFactory: BuffFactory;
  public entityFactory: EntityFactory;
  public graphicsFactory: GraphicsFactory;
  public updatingCommentsStorage: EntityStorage<UpdatingCommentEntity>;
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
  public randomDataGenerator: Phaser.RandomDataGenerator;
  public backgroundMusicPlayer: BackgroundMusicPlayer;
  public timer: Phaser.Timer;

  private constructor(readonly game: Phaser.Game, readonly adapter: EnvironmentAdapter) {
    this.buffDataContainer = new BuffDataContainer();

    this.input = new PhaserInput(game);
    this.inputController = new InputController(game, this.input).ignoreInput();

    this.lawFactory = new LawFactoryImpl();

    this.buffDescription = new BuffDescription();

    this.buffFactory = new BuffFactoryImpl(game, this.inputController, this.lawFactory);

    this.timer = game.time.create(false);
    this.timer.start();

    this.backgroundMusicPlayer = new BackgroundMusicPlayerImpl(this.timer);

    this.randomDataGenerator = new Phaser.RandomDataGenerator([new Date()]);
    const settingsManager = adapter.getSettingsManager();
    this.graphicsFactory = new GraphicsFactoryImpl(
        game,
        this.randomDataGenerator,
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
        this.timer,
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
    this.proxy = new UniverseProxyImpl(
        game,
        this.commentPlacingPolicy,
        this.notifier,
        this.backgroundMusicPlayer);
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
    this.backgroundMusicPlayer.start();
    this.tick.tutorialSystem.start();
  }

  getProxy(): UniverseProxy {
    return this.proxy;
  }
}

let hasGenesis = false;

export default Universe;
