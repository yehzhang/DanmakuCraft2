import {asSequence} from 'sequency';
import SystemEngine from './SystemEngine';

class SystemEnginesEngine<T extends SystemEngine> implements SystemEngine {
  private readonly engines: T[];

  constructor(...engines: T[]) {
    this.engines = engines;
  }

  updateBegin(time: Phaser.Time) {
    for (const engine of this.engines) {
      engine.updateBegin(time);
    }
  }

  updateEnd(time: Phaser.Time) {
    asSequence(this.engines).reverse().forEach(engine => engine.updateEnd(time));
  }

  renderBegin(time: Phaser.Time) {
    for (const engine of this.engines) {
      engine.renderBegin(time);
    }
  }

  renderEnd(time: Phaser.Time) {
    asSequence(this.engines).reverse().forEach(engine => engine.renderEnd(time));
  }
}

export default SystemEnginesEngine;
