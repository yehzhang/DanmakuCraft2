import Colors from './Colors';
import Point from '../util/syntax/Point';
import Perspective from './Perspective';
import Texts from './Texts';
import Sleep from '../util/async/Sleep';
import PhysicalConstants from '../PhysicalConstants';
import ParticlesField from './ParticlesField';
import GraphicsFactory from './graphics/GraphicsFactory';

class OpeningScene {
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
  private updateParticlesField: boolean;

  constructor(private game: Phaser.Game, private graphicsFactory: GraphicsFactory) {
    this.craftRenderings();
  }

  update() {
    if (this.updateParticlesField) {
      this.particlesField.update();
    }
  }

  startParticlesField() {
    this.updateParticlesField = true;
  }

  cleanupWorld() {
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

  async showLoadingStatus(): Promise<void> {
    this.loadingStatusGroup.visible = true;

    this.loadingStatusGroup.alpha = 0;
    let statusAlphaTween = this.game.add.tween(this.loadingStatusGroup)
        .to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);

    return this.waitForCompletion(statusAlphaTween);
  }

  async approachUniverseBorder() {
    await Sleep.after(2000);
    await this.approachTitleText();
    await this.approachTitleVersion();
  }

  async approachEarthFaraway() {
    this.earthPerspective.visible = true;

    let zTween = this.game.add.tween(this.earthPerspective)
        .to({z: 100}, 5000, Phaser.Easing.Quadratic.InOut, true);

    return this.waitForCompletion(zTween);
  }

  showFailedLoadingStatus() {
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

  async showCompletedLoadingStatus() {
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

  async waitForUniverseBorderOpen() {
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

  async passThroughUniverseBorder() {
    return Promise.all([
      this.passThroughTitle(this.titleTextPerspective),
      this.passThroughTitle(this.titleVersionPerspective)]);
  }

  /**
   * Expands the center white square until it is as large as the game.
   */
  async approachEarth() {
    this.game.add.tween(this.earthPerspective)
        .to({z: -OpeningScene.FOCAL_LENGTH}, 4500, Phaser.Easing.Quadratic.InOut, true);

    await Sleep.after(900);
    this.game.camera.fade(Colors.BACKGROUND_NUMBER, 3500);

    return new Promise(resolve => this.game.camera.onFadeComplete.addOnce(resolve));
  }

  async approachParticlesField() {
    return this.particlesField.approach(2000, Phaser.Easing.Linear.None);
  }

  private craftRenderings() {
    this.currentGameSize = this.getCurrentGameSize();

    this.backgroundGroup = this.game.add.group();

    let background = this.game.add.graphics(0, 0, this.backgroundGroup);
    background.beginFill(Colors.BLACK_NUMBER);
    background.drawRect(0, 0, 4000, 4000);
    background.endFill();

    this.borderGroup = this.game.add.group();

    let titleVersionGroup = this.game.add.group(this.borderGroup);
    titleVersionGroup.position = this.currentGameSize.clone().multiply(0.5, 0.4);
    let titleVersion = this.graphicsFactory.createText(
        '          ' + Texts.forName('boot.title.version'),
        94,
        Colors.GOLD);
    titleVersionGroup.add(titleVersion);
    titleVersion.anchor.setTo(0.5, 2);
    this.titleVersionPerspective = new Perspective(
        titleVersionGroup,
        500,
        OpeningScene.FOCAL_LENGTH);
    this.titleVersionPerspective.visible = false;

    let titleTextGroup = this.game.add.group(this.borderGroup);
    titleTextGroup.position = this.currentGameSize.clone().multiply(0.5, 0.4);
    let titleText =
        this.graphicsFactory.createText(Texts.forName('boot.title.text'), 94, Colors.GOLD);
    titleTextGroup.add(titleText);
    titleText.anchor.setTo(0.5, 2);
    this.titleTextPerspective = new Perspective(titleTextGroup, 500, OpeningScene.FOCAL_LENGTH);
    this.titleTextPerspective.visible = false;

    this.loadingStatusGroup = this.game.add.group();
    this.loadingStatusGroup.fixedToCamera = true;
    this.loadingStatusGroup.cameraOffset = this.currentGameSize.clone().multiply(0.95, 0.95);
    this.loadingStatusGroup.visible = false;
    this.loadingStatusText =
        this.graphicsFactory.createText(Texts.forName('boot.loading'), 18, Colors.GREY);
    this.loadingStatusGroup.add(this.loadingStatusText);
    this.loadingStatusText.anchor.setTo(1);

    this.waitForAnyInputGroup = this.game.add.group(this.borderGroup);
    this.waitForAnyInputGroup.position = this.currentGameSize.clone().multiply(0.5, 0.5);
    this.waitForAnyInputGroup.visible = false;
    let waitForAnyInputText =
        this.graphicsFactory.createText(Texts.forName('boot.anyInput'), 32, Colors.WHITE);
    this.waitForAnyInputGroup.add(waitForAnyInputText);
    waitForAnyInputText.anchor.setTo(0.5, -3);

    let earthGroup = this.game.add.group(this.borderGroup);
    earthGroup.position = this.currentGameSize.clone().multiply(0.5, 0.5);
    let earthGraphics = this.game.add.graphics(0, 0, earthGroup);
    earthGraphics.beginFill(Colors.BACKGROUND_NUMBER);
    earthGraphics.drawRect(-100, -100, 200, 200);
    earthGraphics.endFill();
    this.earthPerspective = new Perspective(earthGroup, 1000, OpeningScene.FOCAL_LENGTH);
    this.earthPerspective.visible = true;

    this.particlesFieldGroup = this.game.add.group(this.borderGroup);
    this.particlesFieldGroup.position = this.currentGameSize.clone().multiply(0.5, 0.5);
    let spriteSheetKey = this.graphicsFactory.createPixelParticleSpriteSheet();
    this.particlesField = new ParticlesField(this.game, spriteSheetKey);
    this.particlesFieldGroup.add(this.particlesField.display);

    this.updateParticlesField = false;

    this.game.scale.onSizeChange.add(this.onGameSizeChanged, this);
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

  private async passThroughTitle(perspective: Perspective) {
    let zTween = this.game.add.tween(perspective)
        .to(
            {z: -100},
            4500,
            Phaser.Easing.Quadratic.InOut,
            true);
    return this.waitForCompletion(zTween);
  }
}

export default OpeningScene;
