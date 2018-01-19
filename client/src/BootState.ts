import Texts from './render/Texts';
import Colors from './render/Colors';
import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import Universe, {UniverseFactory} from './Universe';
import {SettingsOptions} from './environment/interface/SettingsManager';
import PhysicalConstants from './PhysicalConstants';
import Point from './util/syntax/Point';
import {Phaser} from './util/alias/phaser';
import Rectangle from './util/syntax/Rectangle';
import Timeout from './util/async/Timeout';
import ParticlesField from './render/ParticlesField';
import Perspective from './render/Perspective';

/**
 * Displays the opening and loads the universe
 */
class BootState extends Phaser.State {
  private static readonly FOCAL_LENGTH = 10;
  private currentGameSize: Point;
  private titleTextPerspective: Perspective;
  private titleVersionPerspective: Perspective;

  private loadingStatusGroup: Phaser.Group;
  private loadingStatusText: Phaser.Text;

  private waitForAnyInputGroup: Phaser.Group;

  private borderGroup: Phaser.Group;

  private backgroundGroup: Phaser.Group;
  private earthPerspective: Perspective;
  private particlesField: ParticlesField;
  private particlesFieldGroup: Phaser.Group;

  constructor(private adapter: EnvironmentAdapter, private makeUniverse: UniverseFactory) {
    super();
    if (__STAGE__) {
      (window as any).boot = this;
    }
  }

  create() {
    this.configureGame();
    this.runState().catch(reason => this.showFailedLoadingStatus(reason));
  }

  startParticlesField(universe: Universe) {
    let ignored = universe.visibility.synchronizeRenderSystem.for(() => {
      if (!this.particlesField) {
        return;
      }

      this.particlesField.update();

      this.startParticlesField(universe);
    });
  }

  private configureGame() {
    // Do not pause on blur.
    this.game.stage.disableVisibilityChange = true;

    // Make tiny television less blurry
    this.game.renderer.renderSession.roundPixels = true;
    // Too ugly when zoomed if turned on
    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setResizeCallback(this.onGameResized, this);

    this.game.stage.backgroundColor = Colors.BACKGROUND_NUMBER;
  }

  private onGameResized(ignored: Phaser.ScaleManager, parentBounds: Rectangle) {
    this.game.scale.setGameSize(parentBounds.width, parentBounds.height);
  }

  private craftRenderings() {
    this.currentGameSize = this.getCurrentGameSize();

    this.backgroundGroup = this.game.add.group();

    let background = this.game.add.graphics(0, 0, this.backgroundGroup);
    background.beginFill(Colors.BLACK_NUMBER);
    background.drawRect(0, 0, 4000, 4000);
    background.endFill();

    let settingsManager = this.adapter.getSettingsManager();
    let fontFamily = settingsManager.getSetting(SettingsOptions.FONT_FAMILY);

    this.borderGroup = this.game.add.group();

    let titleVersionGroup = this.game.add.group(this.borderGroup);
    titleVersionGroup.position = this.currentGameSize.clone().multiply(0.5, 0.4);
    let titleVersion = this.game.add.text(
        0,
        0,
        '          ' + Texts.forName('boot.title.version'),
        {
          font: fontFamily,
          fontSize: 94,
        },
        titleVersionGroup);
    titleVersion.anchor.setTo(0.5, 2);
    titleVersion.addColor(Colors.TRANSPARENT, 0);
    titleVersion.addColor(Colors.GOLD, 4);
    this.titleVersionPerspective = new Perspective(titleVersionGroup, 500, BootState.FOCAL_LENGTH);
    this.titleVersionPerspective.visible = false;

    let titleTextGroup = this.game.add.group(this.borderGroup);
    titleTextGroup.position = this.currentGameSize.clone().multiply(0.5, 0.4);
    let titleText = this.game.add.text(
        0,
        0,
        Texts.forName('boot.title.text'),
        {
          font: fontFamily,
          fontSize: 94,
        },
        titleTextGroup);
    titleText.addColor(Colors.GOLD, 0);
    titleText.addColor(Colors.TRANSPARENT, 4);
    titleText.anchor.setTo(0.5, 2);
    this.titleTextPerspective = new Perspective(titleTextGroup, 500, BootState.FOCAL_LENGTH);
    this.titleTextPerspective.visible = false;

    this.loadingStatusGroup = this.game.add.group();
    this.loadingStatusGroup.fixedToCamera = true;
    this.loadingStatusGroup.cameraOffset = this.currentGameSize.clone().multiply(0.95, 0.95);
    this.loadingStatusGroup.visible = false;
    this.loadingStatusText = this.game.add.text(
        0,
        0,
        Texts.forName('boot.loading'),
        {
          font: fontFamily,
          fontSize: 18,
          fill: Colors.GREY,
        },
        this.loadingStatusGroup);
    this.loadingStatusText.anchor.setTo(1);

    this.waitForAnyInputGroup = this.game.add.group(this.borderGroup);
    this.waitForAnyInputGroup.position = this.currentGameSize.clone().multiply(0.5, 0.5);
    this.waitForAnyInputGroup.visible = false;
    let waitForAnyInputText = this.game.add.text(
        0,
        0,
        Texts.forName('boot.anyInput'),
        {
          font: fontFamily,
          fontSize: 32,
          fill: Colors.WHITE,
        },
        this.waitForAnyInputGroup);
    waitForAnyInputText.anchor.setTo(0.5, -3);

    let earthGroup = this.game.add.group(this.borderGroup);
    earthGroup.position = this.currentGameSize.clone().multiply(0.5, 0.5);
    let earthGraphics = this.game.add.graphics(0, 0, earthGroup);
    earthGraphics.beginFill(Colors.BACKGROUND_NUMBER);
    earthGraphics.drawRect(-100, -100, 200, 200);
    earthGraphics.endFill();
    this.earthPerspective = new Perspective(earthGroup, 1000, BootState.FOCAL_LENGTH);
    this.earthPerspective.visible = true;

    this.particlesFieldGroup = this.game.add.group(this.borderGroup);
    this.particlesFieldGroup.position = this.currentGameSize.clone().multiply(0.5, 0.5);

    this.game.scale.onSizeChange.add(this.onGameSizeChanged, this);
  }

  private static async loadComments(universe: Universe): Promise<() => void> {
    if (__STAGE__) {
      let canFill = (window as any).canFill;
      if (canFill === undefined || canFill) {
        return await (window as any).db.loadComments();
      }
      return () => {
      };
    }
    return await universe.loadComments();
  }

  private onGameSizeChanged() {
    let gameSize = this.getCurrentGameSize();

    this.loadingStatusGroup.cameraOffset = gameSize.clone().multiply(0.95, 0.95);

    this.borderGroup.position = gameSize.clone()
        .subtract(this.currentGameSize.x, this.currentGameSize.y)
        .divide(2, 2);

    if (this.particlesField) {
      this.particlesField.onGameSizeChanged(gameSize.x, gameSize.y);
    }
  }

  private getCurrentGameSize() {
    return Point.of(this.game.width, this.game.height);
  }

  private cleanupWorld() {
    this.loadingStatusGroup.destroy();
    this.waitForAnyInputGroup.destroy();
    this.borderGroup.destroy();
    this.backgroundGroup.destroy();
    this.particlesFieldGroup.destroy();

    if (this.particlesField) {
      this.particlesField.destroy();
    }

    this.game.scale.onSizeChange.remove(this.onGameSizeChanged, this);
  }

  private async runState(): Promise<void> {
    if (__DEV__) {
      await this.loadUniverseAndComments();
    } else {
      await this.showOpeningAndLoadUniverseAndComments();
    }
  }

  private async startMainState(universe: Universe) {
    this.game.state.add('MainState', universe);
    this.game.state.start('MainState', false, false);

    return Promise.all([
      universe.visibility.synchronizeUpdateSystem.noop(),
      universe.visibility.synchronizeRenderSystem.noop()]);
  }

  private async getUniverseAndCommentsLoader(): Promise<[Universe, () => void]> {
    let universe = this.makeUniverse(this.game, this.adapter);
    let proxy = universe.getProxy();
    this.adapter.setProxy(proxy);

    let commentsLoader = await BootState.loadComments(universe);
    return [universe, commentsLoader];
  }

  private async loadUniverseAndComments() {
    let [universe, commentsLoader] = await this.getUniverseAndCommentsLoader();

    commentsLoader();
    universe.onTransitionScreenAllWhite();
    universe.onTransitionFinished();

    await this.startMainState(universe);
  }

  private async showOpeningAndLoadUniverseAndComments() {
    this.craftRenderings();

    let [[universe, commentsLoader]] = await Promise.all([
      this.getUniverseAndCommentsLoader(),
      this.showLoadingStatus(),
      this.approachUniverseBorder(),
      this.approachEarthFaraway()]);
    // Wait for complete rendering??
    await Timeout.after(100);

    // Heavy computing part
    // TODO take a break every once in a while
    commentsLoader();
    await this.startMainState(universe);
    this.buildParticlesField(universe);

    this.startParticlesField(universe);

    await Promise.all([this.showCompletedLoadingStatus(), this.waitForUniverseBorderOpen()]);

    await Promise.all([
      this.passThroughUniverseBorder(),
      this.approachParticlesField(),
      this.approachEarth()]);

    let timeoutPromise = Timeout.after(2 * Phaser.Timer.SECOND);

    this.cleanupWorld();
    universe.onTransitionScreenAllWhite();

    await timeoutPromise;

    await this.fadeInWorld();

    universe.onTransitionFinished();
  }

  private buildParticlesField(universe: Universe) {
    let spriteSheetKey = universe.graphicsFactory.createPixelParticleSpriteSheet();
    this.particlesField = new ParticlesField(this.game, spriteSheetKey);
    this.particlesFieldGroup.add(this.particlesField.display);
  }

  private async showLoadingStatus(): Promise<void> {
    this.loadingStatusGroup.visible = true;

    this.loadingStatusGroup.alpha = 0;
    let statusAlphaTween = this.game.add.tween(this.loadingStatusGroup)
        .to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);

    return this.waitForCompletion(statusAlphaTween);
  }

  private async approachUniverseBorder() {
    await Timeout.after(2000);
    await this.approachTitleText();
    await this.approachTitleVersion();
  }

  private async approachTitleText() {
    this.titleTextPerspective.visible = true;

    let zTween = this.game.add.tween(this.titleTextPerspective)
        .to({z: 100}, 2000, Phaser.Easing.Quadratic.In, true);
    let zTween2 = this.game.add.tween(this.titleTextPerspective)
        .to({z: 0}, 400, Phaser.Easing.Quadratic.Out);
    zTween.chain(zTween2);

    return this.waitForCompletion(zTween2);
  }

  private async approachTitleVersion() {
    this.titleVersionPerspective.visible = true;

    let zTween = this.game.add.tween(this.titleVersionPerspective)
        .to({z: 0}, 1000, Phaser.Easing.Quadratic.InOut, true);

    return this.waitForCompletion(zTween);
  }

  private async approachEarthFaraway() {
    this.earthPerspective.visible = true;

    let zTween = this.game.add.tween(this.earthPerspective)
        .to({z: 100}, 5000, Phaser.Easing.Quadratic.InOut, true);

    return this.waitForCompletion(zTween);
  }

  private showFailedLoadingStatus(error: Error) {
    console.error('Error in BootState:', error);

    if (this.loadingStatusGroup == null) {
      return;
    }

    let ignored = this.updateLoadingStatus(Texts.forName('boot.error'));

    this.game.add.tween(this.borderGroup)
        .to(
            {alpha: 0},
            2000,
            Phaser.Easing.Linear.None,
            true,
            700);
  }

  private async showCompletedLoadingStatus() {
    await this.updateLoadingStatus(Texts.forName('boot.done'));

    this.game.add.tween(this.loadingStatusGroup)
        .to(
            {alpha: 0},
            500,
            Phaser.Easing.Linear.None,
            true,
            2000);
    // Does not wait for loading status to disappear.
  }

  private async updateLoadingStatus(text: string) {
    let loadingStatusAlphaTween = this.game.add.tween(this.loadingStatusGroup)
        .to(
            {alpha: 0},
            300,
            Phaser.Easing.Linear.None,
            true);

    loadingStatusAlphaTween.onComplete.addOnce(() => {
      this.loadingStatusText.text = text;
    });

    let loadingStatusAlphaTween2 = this.game.add.tween(this.loadingStatusGroup)
        .to(
            {alpha: 1},
            300,
            Phaser.Easing.Linear.None);
    loadingStatusAlphaTween.chain(loadingStatusAlphaTween2);

    return this.waitForCompletion(loadingStatusAlphaTween2);
  }

  private async waitForUniverseBorderOpen() {
    let onAnyInputPromise = this.listenOnAnyInput();

    this.waitForAnyInputGroup.visible = true;

    this.waitForAnyInputGroup.alpha = 1;
    let anyInputAlphaTween = this.game.add.tween(this.waitForAnyInputGroup)
        .to(
            {alpha: 0},
            PhysicalConstants.COMMENT_BLINK_DURATION_MS,
            Phaser.Easing.Linear.None,
            true,
            0,
            1,
            true);

    await Promise.race([this.waitForCompletion(anyInputAlphaTween), onAnyInputPromise]);
    await onAnyInputPromise;

    anyInputAlphaTween.stop();

    await this.hideWaitingForAnyInput();
  }

  private async listenOnAnyInput(): Promise<void> {
    return new Promise<void>(resolve => {
      this.game.input.onDown.add(resolve);
      this.game.input.keyboard.onPressCallback = resolve;
    })
        .then(() => {
          this.game.input.onDown.removeAll();
          this.game.input.keyboard.onPressCallback = null as any;
        });
  }

  private async waitForCompletion(tween: Phaser.Tween): Promise<void> {
    return new Promise<void>(resolve => tween.onComplete.addOnce(resolve));
  }

  private async hideWaitingForAnyInput() {
    let waitForAnyInputAlphaTween = this.game.add.tween(this.waitForAnyInputGroup)
        .to({alpha: 0}, 500, Phaser.Easing.Quadratic.Out, true);
    return this.waitForCompletion(waitForAnyInputAlphaTween);
  }

  private async passThroughUniverseBorder() {
    return Promise.all([
      this.passThroughTitle(this.titleTextPerspective),
      this.passThroughTitle(this.titleVersionPerspective)]);
  }

  private async passThroughTitle(perspective: Perspective) {
    let zTween = this.game.add.tween(perspective)
        .to(
            {z: -100},
            4500,
            Phaser.Easing.Quadratic.InOut,
            true);
    return this.waitForCompletion(zTween);
  }

  /**
   * Expands the center white square until it is as large as the game.
   */
  private async approachEarth() {
    this.game.add.tween(this.earthPerspective)
        .to({z: -BootState.FOCAL_LENGTH}, 4500, Phaser.Easing.Quadratic.InOut, true);

    await Timeout.after(900);
    this.game.camera.fade(Colors.BACKGROUND_NUMBER, 3500);

    return new Promise(resolve => this.game.camera.onFadeComplete.addOnce(resolve));
  }

  private async approachParticlesField() {
    return this.particlesField.approach(2000, Phaser.Easing.Linear.None);
  }

  private async fadeInWorld() {
    this.game.camera.flash(Colors.BACKGROUND_NUMBER, 2500, true);
    return new Promise(resolve => this.game.camera.onFlashComplete.addOnce(resolve));
  }
}

export default BootState;
