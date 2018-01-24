import Universe from './Universe';
import {Phaser} from './util/alias/phaser';
import Sleep from './util/async/Sleep';
import OpeningScene from './render/OpeningScene';
import Colors from './render/Colors';
import Rectangle from './util/syntax/Rectangle';
import Provider from './util/syntax/Provider';
import Debug from './util/Debug';
import CommentData from './comment/CommentData';
import AsyncIterable from './util/syntax/AsyncIterable';
import {asSequence} from 'sequency';
import PhysicalConstants from './PhysicalConstants';

class MainState extends Phaser.State {
  private scene: OpeningScene | null;
  private universe: Universe;

  constructor(
      private createUniverse: Provider<Universe>,
      private updatables: Set<{ update(): void }> = new Set(),
      private renderables: Set<{ render(): void }> = new Set()) {
    super();

    if (__STAGE__) {
      (window as any).boot = this;
    }
  }

  preload() {
    if (__DEV__) {
      this.game.load.image('background', 'debug-grid-1920x1920.png');
    }
  }

  async create() {
    this.configureGame();

    if (__DEV__) {
      let sprite = this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
      this.game.world.sendToBack(sprite);
    }

    this.universe = this.createUniverse();

    if (__STAGE__) {
      Debug.set(this.universe);
    }

    try {
      if (__DEV__) {
        await this.loadUniverseButSkipOpeningScene();
      } else {
        await this.loadUniverseAndShowOpeningScene();
      }
    } catch (e) {
      console.error('Error when displaying opening scene:', e);
      if (this.scene) {
        this.scene.showFailedLoadingStatus();
      }
    }
  }

  update() {
    for (let updatable of this.updatables) {
      updatable.update();
    }
  }

  render() {
    for (let renderable of this.renderables) {
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

    // Make tiny television less blurry
    this.game.renderer.renderSession.roundPixels = true;
    // Too ugly when zoomed if turned on
    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setResizeCallback((ignored: Phaser.ScaleManager, parentBounds: Rectangle) => {
      this.game.scale.setGameSize(parentBounds.width, parentBounds.height);
    });

    this.game.stage.backgroundColor = Colors.BACKGROUND_NUMBER;
  }

  private async loadCommentsDataAndListenToNewComments() {
    let commentProvider = this.universe.adapter.getCommentProvider();
    let commentsData = await commentProvider.getAllComments();

    let ignored = this.loadCommentsAsync(commentProvider.getNewComments(), true);
    commentProvider.connect();

    return commentsData;
  }

  private async loadCommentsAsync(commentsData: AsyncIterable<CommentData>, blink: boolean) {
    for await (let commentData of commentsData) {
      this.universe.commentLoader.load(commentData, blink);
    }
  }

  private async loadUniverseButSkipOpeningScene() {
    let commentsData = await this.loadCommentsDataAndListenToNewComments();
    this.universe.commentLoader.loadBatch(commentsData, false);

    this.universe.onTransitionScreenAllWhite();
    this.universe.onTransitionFinished();
  }

  private async loadUniverseAndShowOpeningScene() {
    this.scene = new OpeningScene(this.universe.game, this.universe.graphicsFactory);
    this.updatables.add(this.scene);

    let commentsDataPromise = this.loadCommentsDataAndListenToNewComments();

    await Promise.all([
      this.scene.showLoadingStatus(),
      this.scene.approachUniverseBorder(),
      this.scene.approachEarthFaraway()]);

    this.scene.startParticlesField();

    let commentsData = await commentsDataPromise;
    let dataChunks = asSequence(commentsData)
        .sortedBy(data => data.coordinates.y + data.coordinates.x / PhysicalConstants.WORLD_SIZE)
        .chunk(100);
    for (let dataChunk of dataChunks) {
      await Sleep.moment();  // let animations play
      this.universe.commentLoader.loadBatch(dataChunk, false);
    }

    this.updatables.add(this.universe);
    this.renderables.add(this.universe);
    // Wait for engines to initialize before starting animations.
    await Sleep.moment();

    await Promise.all([
      this.scene.showCompletedLoadingStatus(),
      this.scene.waitForUniverseBorderOpen()]);

    await Promise.all([
      this.scene.passThroughUniverseBorder(),
      this.scene.approachParticlesField(),
      this.scene.approachEarth()]);

    let timeoutPromise = Sleep.after(2 * Phaser.Timer.SECOND);

    this.scene.cleanupWorld();
    this.updatables.delete(this.scene);
    this.scene = null;

    this.universe.onTransitionScreenAllWhite();

    await timeoutPromise;

    await this.fadeInWorld();

    this.universe.onTransitionFinished();
  }
}

export default MainState;
