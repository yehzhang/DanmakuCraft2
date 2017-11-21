import {CommentManager} from './entity/comment';
import Texts from './Texts';
import Colors from './Colors';
import CommentProvider from './environment/CommentProvider';

/**
 * Displays the opening, loads all comments, and adds a new-comment listener
 */
export default class BootState extends Phaser.State {
  private borderGroup: Phaser.Group;
  private loadingStatusGroup: Phaser.Group;
  private starfieldFilter: Phaser.Filter | null;

  constructor(
      private commentProvider: CommentProvider,
      private commentManager: CommentManager) {
    super();
  }

  create() {
    this.game.stage.disableVisibilityChange = true;

    // this.game.world.resize(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE);

    // Enable crisp rendering
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    this.renderGroups();

    // this.positionGroups();

    if (this.game.device.webGL) {
      // TODO add filter
    }

    this.startState().catch(reason => console.error('Error in BootState:', reason));
  }

  private renderGroups() {
    let gameSize = new Phaser.Point(this.game.width, this.game.height);

    this.borderGroup = this.game.add.group();
    this.borderGroup.fixedToCamera = true;
    this.borderGroup.cameraOffset = gameSize.clone().multiply(0.5, 0.5);
    let title = this.commentManager.addText(
        Texts.forName('boot.ui.title'),
        94,
        Colors.GOLD,
        this.borderGroup);
    title.anchor.setTo(0.5, 2);

    this.loadingStatusGroup = this.game.add.group();
    this.loadingStatusGroup.fixedToCamera = true;
    this.loadingStatusGroup.cameraOffset = gameSize.clone().multiply(0.95, 0.95);
    let loadingText = this.commentManager.addText(
        Texts.forName('boot.ui.loading'),
        18,
        Colors.GREY,
        this.loadingStatusGroup);
    loadingText.anchor.setTo(1);
  }

  private async startState(): Promise<void> {
    let [, , error] = await Promise.all([
      this.showLoadingStatus(),
      this.approachUniverseBorder(),
      this.loadComments().catch((reason: Error) => reason),
    ]);

    if (error != null) {
      this.showErrorMessage(error);
      throw error;
    }

    await this.listenOnAnyInput();

    // await Promise.all([
    //   this.passThroughUniverseBorder(),
    //   this.approachEarth(),
    // ]);

    // this.game.state.start(MainState.name, false);
    // TODO clear world manually?
  }

  private async showLoadingStatus(): Promise<void> {
    this.loadingStatusGroup.alpha = 0;
    let statusAlphaTween = this.game.add.tween(this.loadingStatusGroup)
        .to(
            {alpha: 1},
            2000,
            Phaser.Easing.Exponential.Out,
            true);

    return new Promise<void>(resolve => {
      console.debug('Loading status shown');

      statusAlphaTween.onComplete.addOnce(resolve);
    });
  }

  private async loadComments(): Promise<void> {
    let commentsData = await this.commentProvider.getAllComments();
    this.commentManager.loadBatch(commentsData);

    this.commentProvider.connect();
    this.commentManager.listenTo(this.commentProvider);

    console.debug('Comment loaded');
  }

  private async approachUniverseBorder(): Promise<void> {
    this.borderGroup.scale.setTo(0);

    let borderScaleTween = this.game.add.tween(this.borderGroup.scale)
        .to(
            {x: 0.1, y: 0.1},
            2000,
            Phaser.Easing.Quadratic.In,
            true,
            300);
    let borderScaleTween2 = this.game.add.tween(this.borderGroup.scale)
        .to(
            {x: 1, y: 1},
            800,
            Phaser.Easing.Quadratic.Out);
    borderScaleTween.chain(borderScaleTween2);

    return new Promise<void>(resolve => {
      console.debug('Border approached');

      borderScaleTween2.onComplete.addOnce(resolve);
    });
  }

  private showErrorMessage(error: Error) {
    console.debug('Show error message');
    // TODO show error message;
  }

  private async listenOnAnyInput(): Promise<void> {
    return new Promise<void>(resolve => {
      this.game.input.onDown.add(resolve);
      this.game.input.keyboard.onDownCallback = resolve;
    })
        .then(() => {
          console.debug('Got input');

          this.game.input.onDown.removeAll();
          this.game.input.keyboard.onDownCallback = null as any as () => void;
        });
  }

  private async passThroughUniverseBorder(border: Phaser.Sprite): Promise<void> {
    return new Promise<void>(resolve => {
      // TODO

    });
  }

  private async approachEarth(earth: Phaser.Sprite): Promise<void> {
    return new Promise<void>(resolve => {
      // TODO
    });
  }
}
