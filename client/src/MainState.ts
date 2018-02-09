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
import IntermittentIterable from './util/async/IntermittentIterable';

class MainState extends Phaser.State {
  private scene: OpeningScene | null;
  private universe: Universe;

  constructor(
      private createUniverse: Provider<Universe>,
      private updatables: Set<{ update(): void }> = new Set(),
      private renderables: Set<{ render(): void }> = new Set()) {
    super();

    if (__DEV__) {
      (window as any).boot = this;
    }
  }

  async create() {
    this.configureGame();

    this.universe = this.createUniverse();

    if (__DEV__) {
      Debug.set(this.universe);
    }

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

    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setResizeCallback((ignored: Phaser.ScaleManager, parentBounds: Rectangle) => {
      this.game.scale.setGameSize(parentBounds.width, parentBounds.height);
    });

    this.game.stage.backgroundColor = Colors.BACKGROUND_NUMBER;

    // Let camera following with lerp actually focus.
    this.game.camera.roundPx = false;

    // Make tiny television less blurry
    // When combined with the option above, however, some fixed-to-camera displays convulse.
    // this.game.renderer.renderSession.roundPixels = true;

    // Make tiny television less blurry
    // However, it looks too ugly when zoomed if turned on
    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
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

  private async loadUniverseAndShowOpeningScene() {
    this.scene = new OpeningScene(this.universe.game, this.universe.graphicsFactory);
    await this.scene.craftRenderings();
    this.updatables.add(this.scene);

    let commentsDataPromise = this.loadCommentsDataAndListenToNewComments();

    await Promise.all([
      this.scene.showLoadingStatus(),
      this.scene.approachUniverseBorder(),
      this.scene.approachEarthFaraway()]);

    let ignored = this.scene.startParticlesField(100);

    let commentsData = await Sleep.orError(1.5 * Phaser.Timer.MINUTE, commentsDataPromise);
    let dataChunks = asSequence(commentsData)
        .sortedBy(data => data.coordinates.y + data.coordinates.x / PhysicalConstants.WORLD_SIZE)
        .chunk(20);
    for await (let dataChunk of IntermittentIterable.of(dataChunks)) {
      this.universe.commentLoader.loadBatch(dataChunk, false);
    }

    this.updatables.add(this.universe.engineCap);
    this.renderables.add(this.universe.engineCap);
    // Wait for engines to initialize before starting animations.
    await Sleep.break();

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
