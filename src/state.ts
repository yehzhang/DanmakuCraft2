import {EnvironmentAdapter} from './environment/inwardAdapter';
import {CommentManager} from './comment';

/**
 * Displays the opening, loads all comments, and adds a new-comment listener
 */
export class BootState extends Phaser.State {
  private inputKeys: { [keyName: string]: Phaser.Key };
  private error: Error | null;

  constructor(
      private adapter: EnvironmentAdapter,
      private commentManager: CommentManager) {
    super();
    this.error = null;
  }

  preload() {
    this.game.load.image('logo', 'phaser2.png');
  }

  create() {
    this.inputKeys = this.game.input.keyboard.addKeys({
      space: Phaser.KeyCode.SPACEBAR,
      enter: Phaser.KeyCode.ENTER,
    });

    let logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);
    logo.scale.setTo(0.2, 0.2);
    let logoTween = this.game.add.tween(logo.scale).to(
        {x: 1, y: 1},
        2000,
        Phaser.Easing.Bounce.Out,
        true);

    this.game.input.keyboard.enabled = false;

    Promise.resolve()
        .then(() => this.adapter.getCommentProvider())
        .then(provider => provider.getAllComments())
        .then(commentsData => this.commentManager.loadInitialComments(commentsData))
        .catch(reason => this.error = reason);

    // this.game.add.tween(this.logo.scale).to(
    //     {x: 2, y: 2},
    //     1000,
    //     Phaser.Easing.Bounce.Out,
    //     true);
  }

  update() {
    if (this.error != null) {
      // TODO transition to error state
      this.game.state.start(BootFailureState.name, true, false, this.error);
      return;
    }

    if (!this.commentManager.areInitialCommentsLoaded()) {
      return;
    }

    if (this.isKeyDown()) {
      this.game.state.start(EndState.name, false);
    }
  }

  private isKeyDown() {
    return this.inputKeys.space.isDown || this.inputKeys.enter.isDown;
  }
}

export class EndState extends Phaser.State {
  preload() {
    this.game.load.image('logo', 'phaser2.png');
  }

  create() {
    let logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);
    logo.scale.setTo(0.2, 0.2);
    this.game.add.tween(logo.scale).to(
        {x: 0.8, y: 0.8},
        3000,
        Phaser.Easing.Bounce.Out,
        true);
  }
}

class BootFailureState extends Phaser.State {
  private error: Error;

  init(error: Error) {
    this.error = error;
  }

  create() {
    // TODO show error message
    throw new Error('not implemented');
  }
}
