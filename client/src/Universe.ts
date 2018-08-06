import CommentLoader from './comment/CommentLoader';
import CommentLoaderImpl from './comment/CommentLoaderImpl';
import EngineCap from './engine/EngineCap';
import ExistenceEngine from './engine/existence/ExistenceEngine';
import SystemEngine from './engine/SystemEngine';
import SystemEnginesEngine from './engine/SystemEnginesEngine';
import TickEngine from './engine/tick/TickEngine';
import VisibilityEngine from './engine/visibility/VisibilityEngine';
import {ChestEntity, CommentEntity, DisplayableEntity, Player, SignEntity, UpdatingCommentEntity} from './entitySystem/alias';
import Entity from './entitySystem/Entity';
import EntityFactory from './entitySystem/EntityFactory';
import EntityFactoryImpl from './entitySystem/EntityFactoryImpl';
import BuffDataApplier from './entitySystem/system/buff/BuffDataApplier';
import BuffDataContainer from './entitySystem/system/buff/BuffDataContainer';
import BuffDescription from './entitySystem/system/buff/BuffDescription';
import BuffFactory from './entitySystem/system/buff/BuffFactory';
import BuffFactoryImpl from './entitySystem/system/buff/BuffFactoryImpl';
import ChestSystem, {ChestDemolisher, ChestOpener, ChestSpawner} from './entitySystem/system/ChestSystem';
import IncrementRegisteredTimesSystem from './entitySystem/system/existence/IncrementRegisteredTimesSystem';
import TweenBlinkingSystem from './entitySystem/system/existence/TweenBlinkingSystem';
import MoveDisplaySystem from './entitySystem/system/tick/MoveDisplaySystem';
import TutorialSystem from './entitySystem/system/tick/TutorialSystem';
import BackgroundColorSystem from './entitySystem/system/visibility/BackgroundColorSystem';
import BlinkSupportedRenderSystem from './entitySystem/system/visibility/BlinkSupportedRenderSystem';
import CachedChunksRenderSystem from './entitySystem/system/visibility/CachedChunksRenderSystem';
import CachedRenderSystem from './entitySystem/system/visibility/CachedRenderSystem';
import CollisionDetectionSystem from './entitySystem/system/visibility/CollisionDetectionSystem';
import CommitMotionSystem from './entitySystem/system/visibility/CommitMotionSystem';
import ContainerSystem from './entitySystem/system/visibility/ContainerSystem';
import MovingAnimationSystem from './entitySystem/system/visibility/MovingAnimationSystem';
import RenderSystem from './entitySystem/system/visibility/RenderSystem';
import UnmovableDisplayRelativePositioningSystem from './entitySystem/system/visibility/UnmovableDisplayRelativePositioningSystem';
import UpdateSystem from './entitySystem/system/visibility/UpdateSystem';
import AdapterFactory from './environment/AdapterFactory';
import CommentPlacingPolicyImpl from './environment/component/gameWorld/CommentPlacingPolicyImpl';
import UniverseProxyImpl from './environment/component/gameWorld/UniverseProxyImpl';
import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import SettingsManager, {PresetSettingsOptions} from './environment/interface/SettingsManager';
import InputController from './input/InputController';
import PhaserInput from './input/PhaserInput';
import LawFactory from './law/LawFactory';
import LawFactoryImpl from './law/LawFactoryImpl';
import MainState from './MainState';
import BackgroundMusicPlayer from './output/audio/BackgroundMusicPlayer';
import BackgroundMusicPlayerImpl from './output/audio/BackgroundMusicPlayerImpl';
import Notifier from './output/notification/Notifier';
import NotifierFactoryImpl from './output/notification/NotifierFactoryImpl';
import PhysicalConstants from './PhysicalConstants';
import HardCodedPreset from './preset/HardCodedPreset';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import GraphicsFactoryImpl from './render/graphics/GraphicsFactoryImpl';
import Renderer from './render/Renderer';
import {Phaser} from './util/alias/phaser';
import Debug from './util/Debug';
import DynamicProvider from './util/DynamicProvider';
import EntityStorage from './util/entityStorage/EntityStorage';
import GlobalEntityStorage from './util/entityStorage/GlobalEntityStorage';
import QuadtreeEntityStorage from './util/entityStorage/QuadtreeEntityStorage';

/**
 * Instantiates and connects components. Starts the game.
 */
class Universe {
  public afterVisibilityTickEngine!: TickEngine;
  public backgroundMusicPlayer: BackgroundMusicPlayer;
  public beforeVisibilityTickEngine!: TickEngine;
  public buffDataApplier: BuffDataApplier;
  public buffDataContainer: BuffDataContainer;
  public buffDescription: BuffDescription;
  public buffFactory: BuffFactory;
  public cachedCommentsRenderSystem!: CachedChunksRenderSystem;
  public chestsStorage: EntityStorage<ChestEntity>;
  public collisionDetectionSystem!: CollisionDetectionSystem<DisplayableEntity>;
  public commentLoader: CommentLoader;
  public commentsStorage: EntityStorage<CommentEntity>;
  public engineCap: EngineCap;
  public entityFactory: EntityFactory;
  public existenceEngine!: ExistenceEngine;
  public graphicsFactory: GraphicsFactory;
  public input: PhaserInput;
  public inputController: InputController;
  public lawFactory: LawFactory;
  public notifier: Notifier;
  public player: Player;
  public playersStorage: EntityStorage<Player>;
  public randomDataGenerator: Phaser.RandomDataGenerator;
  public renderer: Renderer;
  public settingsManager: SettingsManager;
  public signsStorage: EntityStorage<SignEntity>;
  public spawnPointsStorage: EntityStorage<Entity>;
  public timer: Phaser.Timer;
  public tutorialSystem!: TutorialSystem;
  public updatingCommentsStorage: EntityStorage<UpdatingCommentEntity>;
  public visibilityEngine!: SystemEnginesEngine<VisibilityEngine>;

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
    this.settingsManager = adapter.getSettingsManager();
    this.graphicsFactory = new GraphicsFactoryImpl(
        game,
        this.randomDataGenerator,
        this.settingsManager.getSetting(PresetSettingsOptions.FONT_FAMILY),
        this.settingsManager.getSetting(PresetSettingsOptions.TEXT_SHADOW));

    this.entityFactory = new EntityFactoryImpl(game, this.graphicsFactory, this.buffFactory);

    this.commentsStorage = QuadtreeEntityStorage.create();
    this.updatingCommentsStorage = QuadtreeEntityStorage.create();
    this.playersStorage = GlobalEntityStorage.create();
    this.chestsStorage = GlobalEntityStorage.create();
    this.spawnPointsStorage = GlobalEntityStorage.create();
    this.signsStorage = GlobalEntityStorage.create();

    const preset = new HardCodedPreset(this.entityFactory, this.graphicsFactory);
    preset.populateSigns(this.signsStorage);
    preset.populateSpawnPoints(
        this.spawnPointsStorage, this.signsStorage);

    this.player = this.entityFactory.createPlayer(preset.getPlayerSpawnPoint());
    this.playersStorage.register(this.player);

    const notifierFactory = new NotifierFactoryImpl(game, this.graphicsFactory);
    this.notifier = notifierFactory.createPoppingNotifier(this.player.display);

    this.renderer = new Renderer(game).turnOff();

    this.buffDataApplier =
        new BuffDataApplier(this.player, this.buffDataContainer, this.buffFactory);

    this.commentLoader = new CommentLoaderImpl(
        game,
        this.commentsStorage,
        this.updatingCommentsStorage,
        this.entityFactory,
        this.buffDataApplier);

    this.setupEngines();
    this.engineCap = new EngineCap(
        new SystemEnginesEngine<SystemEngine>(
            this.existenceEngine,
            this.beforeVisibilityTickEngine,
            this.visibilityEngine,
            this.afterVisibilityTickEngine),
        this.game.time);
  }

  static genesis(): void {
    if (hasGenesis) {
      throw new Error('The Universe has had its genesis');
    }

    hasGenesis = true;

    const state: MainState = new MainState(() => {
      const universe = new Universe(game, adapter);

      const universeProxy = new UniverseProxyImpl(
          game,
          new CommentPlacingPolicyImpl(
              universe.collisionDetectionSystem,
              universe.graphicsFactory,
              universe.notifier,
              universe.buffDataContainer,
              universe.player,
              universe.renderer.fixedToCameraLayer),
          universe.notifier,
          universe.backgroundMusicPlayer);
      adapter.setProxy(universeProxy);

      if (__DEV__) {
        Debug.set(universe);
        (window as any).universeProxy = universeProxy;
      }

      return universe;
    });

    const adapter = new AdapterFactory().createAdapter();
    const game = new Phaser.Game({
      width: 1e-10,
      height: 1e-10,
      parent: adapter.getGameContainerProvider().getContainerId(),
      state,
    });
  }

  onTransitionScreenAllWhite() {
    this.renderer.turnOn().focus(this.player);
  }

  onTransitionFinished() {
    this.inputController.receiveInput();
    this.backgroundMusicPlayer.start();
    this.tutorialSystem.start();
  }

  private setupEngines() {
    // Setup existence.
    const existenceEngineBuilder = ExistenceEngine.newBuilder();
    existenceEngineBuilder.onUpdate()
        .apply(new IncrementRegisteredTimesSystem())
        .toEntities().of(this.commentsStorage).and(this.updatingCommentsStorage);
    existenceEngineBuilder.onRender()
        .apply(new TweenBlinkingSystem(this.game))
        .toEntities().of(this.commentsStorage).and(this.updatingCommentsStorage)

        .build();
    this.existenceEngine = existenceEngineBuilder.build();


    // Setup tick.
    const renderRadius = new DynamicProvider(getRenderRadius(this.game));
    this.game.scale.onSizeChange.add(() => renderRadius.update(getRenderRadius(this.game)));

    const chestLaw = this.lawFactory.createChestLaw(this.player, renderRadius);
    const chestSystem = new ChestSystem(
        new ChestOpener(
            this.game,
            this.player,
            this.buffDataApplier,
            chestLaw,
            this.notifier,
            this.buffDescription),
        new ChestSpawner(this.chestsStorage, this.entityFactory, chestLaw, __DEV__),
        new ChestDemolisher(this.chestsStorage));

    this.tutorialSystem = new TutorialSystem(
        this.timer,
        this.settingsManager,
        this.notifier,
        this.input);

    const displayPositioningSystem = new UnmovableDisplayRelativePositioningSystem(this.player);
    this.cachedCommentsRenderSystem =
        new CachedChunksRenderSystem(this.renderer.floatingLayer, displayPositioningSystem);

    const beforeVisibilityTickEngineBuilder = TickEngine.newBuilder();
    beforeVisibilityTickEngineBuilder.onUpdate()
        .apply(chestSystem).atEnter()
        .apply(this.tutorialSystem).atEnter();
    beforeVisibilityTickEngineBuilder.onRender()
        .apply(new MoveDisplaySystem(this.player)).atEnter();
    this.beforeVisibilityTickEngine = beforeVisibilityTickEngineBuilder.build();

    const afterVisibilityTickEngineBuilder = TickEngine.newBuilder();
    afterVisibilityTickEngineBuilder.onRender()
        .apply(this.cachedCommentsRenderSystem).atEnter();
    this.afterVisibilityTickEngine = afterVisibilityTickEngineBuilder.build();


    // Setup visibility.
    this.collisionDetectionSystem = new CollisionDetectionSystem();

    const foregroundVisibilityEngineBuilder = VisibilityEngine.newBuilder(
        this.player,
        renderRadius,
        PhysicalConstants.FOREGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS);
    foregroundVisibilityEngineBuilder.onUpdate()
        .apply(new UpdateSystem())
        .toEntities().of(this.playersStorage).and(this.updatingCommentsStorage)

        .apply(this.collisionDetectionSystem)
        .toEntities().of(this.commentsStorage).and(this.updatingCommentsStorage)

        .apply(chestSystem)
        .toEntities().of(this.chestsStorage);
    foregroundVisibilityEngineBuilder.onRender()
        .apply(new BlinkSupportedRenderSystem(
            this.renderer.floatingLayer,
            this.cachedCommentsRenderSystem,
            new RenderSystem(this.renderer.floatingLayer),
            displayPositioningSystem))
        .toEntities().of(this.commentsStorage)

        .apply(new RenderSystem(this.renderer.floatingLayer))
        .toEntities().of(this.updatingCommentsStorage)

        .apply(new RenderSystem(this.renderer.groundLayer))
        .toEntities().of(this.chestsStorage)

        .apply(new RenderSystem(this.renderer.playersLayer))
        .toEntities().of(this.playersStorage)

        .apply(new CachedRenderSystem(this.renderer.backgroundLayer))
        .toEntities().of(this.signsStorage)

        .apply(displayPositioningSystem)
        .toEntities()
        .of(this.updatingCommentsStorage).and(this.chestsStorage).and(this.signsStorage)

        .apply(new MovingAnimationSystem())
        .toEntities().of(this.playersStorage)

        .apply(new CommitMotionSystem())
        .toEntities().of(this.playersStorage);

    const spawnPointsContainerSystem = new ContainerSystem<Entity>();

    const backgroundVisibilityEngineBuilder = VisibilityEngine.newBuilder(
        this.player,
        new DynamicProvider(PhysicalConstants.BACKGROUND_SAMPLING_RADIUS),
        PhysicalConstants.BACKGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS);
    backgroundVisibilityEngineBuilder.onRender()
        .apply(spawnPointsContainerSystem)
        .toEntities().of(this.spawnPointsStorage)

        .apply(new BackgroundColorSystem(this.game, spawnPointsContainerSystem))
        .toEntities().of(this.commentsStorage).and(this.updatingCommentsStorage);

    this.visibilityEngine = new SystemEnginesEngine(
        foregroundVisibilityEngineBuilder.build(),
        backgroundVisibilityEngineBuilder.build());
  }
}

let hasGenesis = false;

function getRenderRadius(game: Phaser.Game) {
  return PhysicalConstants.getRenderRadius(game.width, game.height);
}

export default Universe;
