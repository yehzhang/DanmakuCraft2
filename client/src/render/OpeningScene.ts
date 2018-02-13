import Colors from './Colors';
import Point from '../util/syntax/Point';
import Perspective from './Perspective';
import Texts from './Texts';
import Sleep from '../util/async/Sleep';
import PhysicalConstants from '../PhysicalConstants';
import ParticlesField from './ParticlesField';
import GraphicsFactory from './graphics/GraphicsFactory';
import Semaphore from '../util/async/Semaphore';

class OpeningScene {
  private static readonly FOCAL_LENGTH = 10;

  private currentGameSize: Point;
  private titlePerspective: Perspective;

  private loadingStatusGroup: Phaser.Group;
  private loadingStatusText: Phaser.Text;

  private waitForAnyInputGroup: Phaser.Group;

  private borderGroup: Phaser.Group;

  private backgroundGroup: Phaser.Group;
  private earthPerspective: Perspective;

  private particlesField: ParticlesField;
  private updateParticlesField: boolean;

  constructor(
      private game: Phaser.Game,
      private graphicsFactory: GraphicsFactory,
      private resizedSemaphore: Semaphore = new Semaphore(0)) {
    game.scale.onSizeChange.addOnce(() => resizedSemaphore.release());
  }

  update() {
    if (this.updateParticlesField) {
      this.particlesField.update();
    }
  }

  async startParticlesField(delay: number = 0) {
    await Sleep.after(delay);
    this.updateParticlesField = true;
  }

  async craftRenderings() {
    await this.resizedSemaphore.acquire();
    this.currentGameSize = this.getCurrentGameSize();

    this.backgroundGroup = this.game.add.group();

    let background = this.game.add.graphics(0, 0, this.backgroundGroup);
    background.beginFill(Colors.BLACK_NUMBER);
    background.drawRect(0, 0, 4000, 4000);
    background.endFill();

    this.borderGroup = this.game.add.group();

    let title = this.graphicsFactory.createText(Texts.forName('boot.title'), 64, Colors.GOLD);
    title.y = this.currentGameSize.y * -0.25;
    title.anchor.setTo(0.5);
    this.borderGroup.add(title);
    this.titlePerspective = new Perspective(title, 500, OpeningScene.FOCAL_LENGTH, true);
    this.titlePerspective.visible = false;

    this.loadingStatusGroup = this.game.add.group();
    this.loadingStatusGroup.fixedToCamera = true;
    this.loadingStatusGroup.cameraOffset = this.currentGameSize.clone().multiply(0.95, 0.95);
    this.loadingStatusGroup.visible = false;
    this.loadingStatusText =
        this.graphicsFactory.createText(Texts.forName('boot.loading'), 18, Colors.GREY);
    this.loadingStatusGroup.add(this.loadingStatusText);
    this.loadingStatusText.anchor.setTo(1);

    this.waitForAnyInputGroup = this.game.add.group(this.borderGroup);
    this.waitForAnyInputGroup.visible = false;
    let waitForAnyInputText =
        this.graphicsFactory.createText(Texts.forName('boot.anyInput'), 24, Colors.WHITE);
    waitForAnyInputText.anchor.setTo(0.5);
    waitForAnyInputText.position.y = this.currentGameSize.y * 0.25;
    this.waitForAnyInputGroup.add(waitForAnyInputText);

    let earthGraphics = this.game.add.graphics(0, 0, this.borderGroup);
    earthGraphics.beginFill(Colors.BACKGROUND_NUMBER);
    earthGraphics.drawRect(-100, -100, 200, 200);
    earthGraphics.endFill();
    this.earthPerspective = new Perspective(earthGraphics, 1000, OpeningScene.FOCAL_LENGTH, true);
    this.earthPerspective.visible = true;

    let spriteSheetKey = this.graphicsFactory.createPixelParticleSpriteSheet();
    this.particlesField = new ParticlesField(this.game, spriteSheetKey);
    this.borderGroup.add(this.particlesField.display);

    this.updateParticlesField = false;

    this.onGameSizeChanged();
    this.game.scale.onSizeChange.add(this.onGameSizeChanged, this);
  }

  cleanupWorld() {
    this.loadingStatusGroup.destroy();
    this.waitForAnyInputGroup.destroy();
    this.borderGroup.destroy();
    this.backgroundGroup.destroy();

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

    this.titlePerspective.visible = true;

    let zTween = this.game.add.tween(this.titlePerspective)
        .to({z: 0}, 3000, Phaser.Easing.Quadratic.InOut, true);

    return this.waitForCompletion(zTween);
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

    let blackScreen = this.game.add.graphics(0, 0, this.borderGroup);
    blackScreen.beginFill(Colors.BLACK_NUMBER);
    blackScreen.drawRect(-2000, -2000, 4000, 4000);
    blackScreen.endFill();

    blackScreen.alpha = 0;
    this.game.add.tween(blackScreen)
        .to(
            {alpha: 1},
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
    let zTween = this.game.add.tween(this.titlePerspective)
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

  private onGameSizeChanged() {
    this.currentGameSize = this.getCurrentGameSize();

    this.loadingStatusGroup.cameraOffset = this.currentGameSize.clone().multiply(0.95, 0.95);

    this.borderGroup.position = this.currentGameSize.clone().divide(2, 2);

    if (this.particlesField) {
      this.particlesField.onGameSizeChanged(this.currentGameSize.x, this.currentGameSize.y);
    }
  }

  private getCurrentGameSize() {
    return Point.of(this.game.width, this.game.height);
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
    let resolveRef: () => void;
    return new Promise<void>(resolve => {
      resolveRef = resolve;
      this.game.input.onDown.add(resolve);
      this.game.input.keyboard.onDownCallback = resolve;
    })
        .then(() => {
          this.game.input.onDown.remove(resolveRef);
          this.game.input.keyboard.onDownCallback = null as any;
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
}

export default OpeningScene;
