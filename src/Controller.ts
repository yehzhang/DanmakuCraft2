export default class Controller {
  private keys: { [keyName: string]: Phaser.Key };

  constructor(game: Phaser.Game) {
    this.keys = game.input.keyboard.addKeys({
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN,
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      w: Phaser.KeyCode.W,
      s: Phaser.KeyCode.S,
      a: Phaser.KeyCode.A,
      d: Phaser.KeyCode.D,
      h: Phaser.KeyCode.H,
      j: Phaser.KeyCode.J,
      k: Phaser.KeyCode.K,
      l: Phaser.KeyCode.L,
    });

    // TODO support for pointer
    // this.game.input.

  }

  get moveLeft() {
    return this.left && !this.right;
  }

  get moveRight() {
    return !this.left && this.right;
  }

  get moveUp() {
    return this.up && !this.down;
  }

  get moveDown() {
    return !this.up && this.down;
  }

  get left() {
    return this.keys.left.isDown || this.keys.a.isDown || this.keys.h.isDown;
  }

  get right() {
    return this.keys.right.isDown || this.keys.d.isDown || this.keys.l.isDown;
  }

  get up() {
    return this.keys.up.isDown || this.keys.w.isDown || this.keys.k.isDown;
  }

  get down() {
    return this.keys.down.isDown || this.keys.s.isDown || this.keys.j.isDown;
  }

  receiveInput() {
    this.turnInput(true);
    return this;
  }

  ignoreInput() {
    this.turnInput(false);
    return this;
  }

  private turnInput(enabled: boolean) {
    for (let keyName of Object.keys(this.keys)) {
      this.keys[keyName].enabled = enabled;
    }
  }
}
