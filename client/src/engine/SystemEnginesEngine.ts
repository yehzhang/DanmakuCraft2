import SystemEngine from './SystemEngine';

class SystemEnginesEngine<T extends SystemEngine> implements SystemEngine {
  constructor(private engines: T[]) {
  }

  update(time: Phaser.Time) {
    for (let engine of this.engines) {
      engine.update(time);
    }
  }

  render(time: Phaser.Time) {
    for (let engine of this.engines) {
      engine.render(time);
    }
  }
}

export default SystemEnginesEngine;
