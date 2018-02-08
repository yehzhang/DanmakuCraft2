interface SystemEngine {
  updateBegin(time: Phaser.Time): void;

  updateEnd(time: Phaser.Time): void;

  renderBegin(time: Phaser.Time): void;

  renderEnd(time: Phaser.Time): void;
}

export default SystemEngine;
