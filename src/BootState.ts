import Texts from './render/Texts';
import Colors from './render/Colors';
import EnvironmentAdapter from './environment/interface/EnvironmentAdapter';
import Universe, {UniverseFactory} from './Universe';
import {SettingsOptions} from './environment/interface/SettingsManager';
import PhysicalConstants from './PhysicalConstants';
import Point from './util/Point';

/**
 * Displays the opening and loads the universe
 */
export default class BootState extends Phaser.State {
  private initialGameSize: Point;
  private titleGroup: Phaser.Group;

  private loadingStatusGroup: Phaser.Group;
  private loadingStatusText: Phaser.Text;

  private waitForAnyInputGroup: Phaser.Group;
  private earthGroup: Phaser.Group;
  private borderGroup: Phaser.Group;

  constructor(private adapter: EnvironmentAdapter, private makeUniverse: UniverseFactory) {
    super();
  }

  create() {
    this.configureGame();
    this.craftRenderGroups();
    this.runState().catch(reason => this.showFailedLoadingStatus(reason));
  }

  private configureGame() {
    // Pause on blur so that music stops playing and new comments blink on focus.
    // this.game.stage.disableVisibilityChange = true;

    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  }

  private craftRenderGroups() {
    this.initialGameSize = this.getCurrentGameSize();

    let settingsManager = this.adapter.getSettingsManager();
    let fontFamily = settingsManager.getSetting(SettingsOptions.FONT_FAMILY);

    this.borderGroup = this.game.add.group();

    this.titleGroup = this.game.add.group(this.borderGroup);
    this.titleGroup.position = this.initialGameSize.clone().multiply(0.5, 0.5);
    this.titleGroup.visible = false;
    let title = this.game.add.text(
        0,
        0,
        Texts.forName('boot.title'),
        {
          font: fontFamily,
          fontSize: 94,
          fill: Colors.GOLD,
        },
        this.titleGroup);
    title.anchor.setTo(0.5, 2);

    this.loadingStatusGroup = this.game.add.group();
    this.loadingStatusGroup.fixedToCamera = true;
    this.loadingStatusGroup.cameraOffset = this.initialGameSize.clone().multiply(0.95, 0.95);
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
    this.waitForAnyInputGroup.position = this.initialGameSize.clone().multiply(0.5, 0.5);
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

    this.earthGroup = this.game.add.group(this.borderGroup);
    this.earthGroup.position = this.initialGameSize.clone().multiply(0.5, 0.5);
    this.earthGroup.visible = false;
    let earthGraphics = this.game.add.graphics(0, 0, this.earthGroup);
    earthGraphics.beginFill(Colors.SNOW_NUMBER);
    earthGraphics.drawRect(-5, -5, 10, 10);
    earthGraphics.endFill();

    this.game.scale.onSizeChange.add(this.onGameResize, this);
  }

  private onGameResize() {
    let gameSize = this.getCurrentGameSize();

    this.loadingStatusGroup.cameraOffset = gameSize.clone().multiply(0.95, 0.95);

    this.borderGroup.position = gameSize.clone()
        .subtract(this.initialGameSize.x, this.initialGameSize.y)
        .divide(2, 2);
  }

  private getCurrentGameSize() {
    return Point.of(this.game.width, this.game.height);
  }

  private async runState(): Promise<void> {
    let universe;
    if (__DEBUG__) {
      universe = await this.loadUniverse();

      (window as any).universe = universe;
    } else {
      universe = await this.showOpeningAndLoadUniverse();
    }

    this.game.state.add('MainState', universe);
    this.game.state.start('MainState', false, false);
  }

  private async loadUniverse(): Promise<Universe> {
    let universe = this.makeUniverse(this.game, this.adapter);

    let proxy = universe.getProxy();
    this.adapter.setProxy(proxy);

    await universe.loadComments();

    return universe;
  }

  private async showOpeningAndLoadUniverse(): Promise<Universe> {
    let [universe, , , ] = await Promise.all([
      this.loadUniverse().catch(reason => reason),
      this.showLoadingStatus(),
      this.approachUniverseBorder(),
      this.approachEarthFaraway(),
    ]);

    if (universe instanceof Error) {
      throw universe;
    }

    await Promise.all([
      this.showCompletedLoadingStatus(),
      this.waitForUniverseBorderOpen(),
    ]);

    await Promise.all([
      this.passThroughUniverseBorder(),
      this.approachEarth(),
    ]);

    return universe;
  }

  private async showLoadingStatus(): Promise<void> {
    this.loadingStatusGroup.visible = true;

    this.loadingStatusGroup.alpha = 0;
    let statusAlphaTween = this.game.add.tween(this.loadingStatusGroup)
        .to(
            {alpha: 1},
            2000,
            Phaser.Easing.Exponential.Out,
            true);

    return new Promise<void>(resolve => {
      statusAlphaTween.onComplete.addOnce(resolve);
    });
  }

  private async approachUniverseBorder(): Promise<void> {
    this.titleGroup.visible = true;

    this.titleGroup.alpha = 0;
    this.game.add.tween(this.titleGroup)
        .to(
            {alpha: 1},
            200,
            Phaser.Easing.Linear.None,
            true,
            400);

    this.titleGroup.scale.setTo(0);
    let titleScaleTween = this.game.add.tween(this.titleGroup.scale)
        .to(
            {x: 0.1, y: 0.1},
            2000,
            Phaser.Easing.Quadratic.In,
            true,
            300);
    let titleScaleTween2 = this.game.add.tween(this.titleGroup.scale)
        .to(
            {x: 1, y: 1},
            800,
            Phaser.Easing.Quadratic.Out);
    titleScaleTween.chain(titleScaleTween2);

    return new Promise<void>(resolve => {
      titleScaleTween2.onComplete.addOnce(resolve);
    });
  }

  private async approachEarthFaraway() {
    this.earthGroup.visible = true;

    this.earthGroup.alpha = 0;
    this.game.add.tween(this.earthGroup)
        .to(
            {alpha: 1},
            200,
            Phaser.Easing.Linear.None,
            true,
            400);

    this.earthGroup.scale.setTo(0);
    let earthScaleTween = this.game.add.tween(this.earthGroup.scale)
        .to(
            {x: 1, y: 1},
            2700,
            Phaser.Easing.Quadratic.In,
            true,
            300);

    return new Promise<void>(resolve => {
      earthScaleTween.onComplete.addOnce(resolve);
    });
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

    return new Promise<void>(resolve => {
      loadingStatusAlphaTween2.onComplete.addOnce(resolve);
    });
  }

  private async waitForUniverseBorderOpen() {
    let onAnyInputPromise = this.listenOnAnyInput();

    this.waitForAnyInputGroup.alpha = 1;
    let anyInputAlphaTween = this.game.add.tween(this.waitForAnyInputGroup)
        .to(
            {alpha: 0.1},
            PhysicalConstants.COMMENT_BLINK_DURATION_MS,
            Phaser.Easing.Linear.None,
            true,
            0,
            1,
            true);

    await Promise.race([
      this.showWaitingForAnyInput(anyInputAlphaTween),
      onAnyInputPromise,
    ]);
    await onAnyInputPromise;

    anyInputAlphaTween.stop();

    await this.hideWaitingForAnyInput();
  }

  private async listenOnAnyInput(): Promise<void> {
    return new Promise<void>(resolve => {
      this.game.input.onDown.add(resolve);
      this.game.input.keyboard.onDownCallback = resolve;
    })
        .then(() => {
          this.game.input.onDown.removeAll();
          this.game.input.keyboard.onDownCallback = null as any;
        });
  }

  private async showWaitingForAnyInput(anyInputAlphaTween: Phaser.Tween) {
    this.waitForAnyInputGroup.visible = true;

    return new Promise<void>(resolve => {
      anyInputAlphaTween.onComplete.addOnce(resolve);
    });
  }

  private async hideWaitingForAnyInput() {
    let waitForAnyInputAlphaTween = this.game.add.tween(this.waitForAnyInputGroup)
        .to(
            {alpha: 0},
            500,
            Phaser.Easing.Quadratic.Out,
            true);

    return new Promise<void>(resolve => {
      waitForAnyInputAlphaTween.onComplete.addOnce(resolve);
    });
  }

  private async passThroughUniverseBorder(): Promise<void> {
    this.game.add.tween(this.titleGroup.scale)
        .to(
            {x: 5, y: 5},
            1000,
            Phaser.Easing.Cubic.In,
            true);

    let titlePositionTween = this.game.add.tween(this.titleGroup.position)
        .to(
            {y: -100},
            1000,
            Phaser.Easing.Cubic.In,
            true);

    return new Promise<void>(resolve => {
      titlePositionTween.onComplete.addOnce(resolve);
    });
  }

  /**
   * Expands the center white square until it is as large as the game.
   */
  private async approachEarth() {
    let targetScale = this.initialGameSize.divide(this.earthGroup.width, this.earthGroup.height);
    targetScale.setTo(Math.max(targetScale.x, targetScale.y) * 5);

    let earthScaleTween = this.game.add.tween(this.earthGroup.scale)
        .to(
            targetScale,
            4000,
            Phaser.Easing.Quartic.In,
            true);

    return new Promise<void>(resolve => {
      earthScaleTween.onStart.addOnce(() => {
        this.game.camera.fade(Colors.SNOW_NUMBER, 2500);

        this.game.camera.onFadeComplete.addOnce(() => {
          this.game.stage.backgroundColor = Colors.SNOW;

          earthScaleTween.stop();

          resolve();
        });
      });
    });
  }
}
