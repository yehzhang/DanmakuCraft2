interface SystemEngine {
  update(time: Phaser.Time): void;

  render(time: Phaser.Time): void;
}

export default SystemEngine;
