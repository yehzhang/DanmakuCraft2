import {asSequence} from 'sequency';
import CommentData from './comment/CommentData';
import ConfigProvider from './environment/config/ConfigProvider';
import PhysicalConstants from './PhysicalConstants';
import Colors from './render/Colors';
import OpeningScene from './render/OpeningScene';
import Universe from './Universe';
import {Phaser} from './util/alias/phaser';
import RenderThrottler from './util/async/RenderThrottler';
import Sleep from './util/async/Sleep';
import AsyncIterable from './util/syntax/AsyncIterable';
import Provider from './util/syntax/Provider';
import Rectangle from './util/syntax/Rectangle';
import spriteSheet = require('../../data/audio/background_sprite.json');

class MainState extends Phaser.State {
  private scene: OpeningScene | null = null;
  private universe!: Universe;

  constructor(
      private readonly createUniverse: Provider<Universe>,
      private readonly updatables: Set<{ update(): void }> = new Set(),
      private readonly renderables: Set<{ render(): void }> = new Set()) {
    super();
    if (__DEV__) {
      (window as any).boot = this;
    }
  }

  async create() {
    this.configureGame();

    this.universe = this.createUniverse();

    try {
      await this.loadUniverseAndShowOpeningScene();
    } catch (e) {
      console.error('Error when displaying opening scene:', e);
      if (this.scene) {
        this.scene.showFailedLoadingStatus();
      }
    }
  }

  update() {
    for (const updatable of this.updatables) {
      updatable.update();
    }
  }

  render() {
    for (const renderable of this.renderables) {
      renderable.render();
    }
  }

  async fadeInWorld() {
    this.game.camera.flash(Colors.BACKGROUND_NUMBER, 2500, true);
    return new Promise(resolve => this.game.camera.onFlashComplete.addOnce(resolve));
  }

  private configureGame() {
    // Do not pause on blur.
    this.game.stage.disableVisibilityChange = true;

    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setResizeCallback((ignored: Phaser.ScaleManager, parentBounds: Rectangle) => {
      this.game.scale.setGameSize(parentBounds.width, parentBounds.height);
    });

    this.game.stage.backgroundColor = Colors.BACKGROUND_NUMBER;

    this.setRenderRoundPixels(true);
    // this.setRenderRoundPixels(false);

    // Makes tiny television less blurry.
    // However, it looks too ugly when zoomed if turned on.
    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.game.load.baseURL = ConfigProvider.get().baseUrl;

    this.game.sound.muteOnPause = false;
  }

  private setRenderRoundPixels(value: boolean) {
    // If true, entities are less blurry.
    this.game.renderer.renderSession.roundPixels = value;

    // If false, camera is able to center on player when lerp is enabled.
    // If true, text entities jitter periodically when player is moving?
    // Must be true if `renderSession.roundPixels` is true, or uncached entities will jitter.
    this.game.camera.roundPx = value;
  }

  private async loadCommentsDataAndListenToNewComments() {
    const commentProvider = this.universe.adapter.getCommentProvider();
    const commentsData = await commentProvider.getAllComments();

    const ignored = this.loadComments(commentProvider.getNewComments(), true);
    commentProvider.connect();

    return commentsData;
  }

  private async loadComments(commentsData: AsyncIterable<CommentData>, blink: boolean) {
    for await (const commentData of commentsData) {
      this.universe.commentLoader.load(commentData, blink);
    }
  }

  private async loadCommentsInitial(commentsData: Iterable<CommentData>) {
    const commentsDataArray = Array.from(commentsData);

    // Refrain from loading too many updating comments.
    asSequence(commentsDataArray).filter(commentData => commentData.buffData != null)
        .drop(PhysicalConstants.MAX_UPDATING_COMMENTS_COUNT)
        .forEach(commentData => (commentData as any).buffData = null);
    await Sleep.moment();

    const dataChunks = asSequence(commentsDataArray)
        .sortedBy(data => data.coordinates.y + data.coordinates.x / PhysicalConstants.WORLD_SIZE)
        .chunk(5);
    const throttler = new RenderThrottler();
    const sleepDuration = 2;
    for (const dataChunk of dataChunks) {
      while (!throttler.run(() => {
        this.universe.commentLoader.loadBatch(dataChunk, /* blink */ false);
      }, this.game.time, sleepDuration)) {
        await Sleep.after(sleepDuration);
      }
    }
  }

  private async loadAudios() {
    const audioKey = this.universe.randomDataGenerator.uuid();
    this.game.load.audiosprite(audioKey, spriteSheet.resources, undefined, spriteSheet);

    await new Promise((resolve, reject) => {
      const onFileCompleted = (progress: number, fileKey: string, success: boolean) => {
        if (fileKey !== audioKey) {
          return;
        }
        if (success) {
          resolve();
        } else {
          reject('Failed to load audios');
        }
      };
      this.game.load.onFileComplete.add(onFileCompleted as any);
    });

    const audioSprite = this.game.add.audioSprite(audioKey);
    this.universe.backgroundMusicPlayer.setSprite(audioSprite);
  }

  private async loadUniverseAndShowOpeningScene() {
    this.scene = new OpeningScene(this.universe.game, this.universe.graphicsFactory);
    await this.scene.craftRenderings();
    this.updatables.add(this.scene);

    const dataPromise = Promise.all([
      this.loadCommentsDataAndListenToNewComments(),
      this.loadAudios()]);
    this.game.load.start();

    await Promise.all([
      this.scene.showLoadingStatus(),
      this.scene.approachUniverseBorder(),
      this.scene.approachEarthFaraway()]);

    const ignored = this.scene.startParticlesField(100);

    const [commentsData] = await Sleep.orError(0.75 * Phaser.Timer.MINUTE, dataPromise);
    await this.loadCommentsInitial(commentsData);

    await this.startAndWarmUpEngine();

    await Promise.all([
      this.scene.showCompletedLoadingStatus(),
      this.scene.waitForUniverseBorderOpen()]);

    await Promise.all([
      this.scene.passThroughUniverseBorder(),
      this.scene.approachParticlesField(),
      this.scene.approachEarth()]);

    const timeoutPromise = Sleep.after(2 * Phaser.Timer.SECOND);

    this.scene.cleanupWorld();
    this.updatables.delete(this.scene);
    this.scene = null;

    this.universe.onTransitionScreenAllWhite();

    await timeoutPromise;

    await this.fadeInWorld();

    this.universe.onTransitionFinished();
  }

  private async startAndWarmUpEngine() {
    this.updatables.add(this.universe.engineCap);
    this.renderables.add(this.universe.engineCap);

    // Wait for engines to initialize.
    await Sleep.break();

    // Cached comments render system may need some more time.
    while (this.universe.cachedCommentsRenderSystem.getUpdateQueueSize()) {
      await Sleep.break();
    }
  }
}

export default MainState;
