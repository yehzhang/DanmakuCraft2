import SystemEngine from './SystemEngine';
import {asSequence} from 'sequency';

class SystemEnginesEngine<T extends SystemEngine> implements SystemEngine {
  constructor(private engines: T[]) {
  }

  updateBegin(time: Phaser.Time) {
    for (let engine of this.engines) {
      engine.updateBegin(time);
    }
  }

  updateEnd(time: Phaser.Time) {
    asSequence(this.engines).reverse().forEach(engine => engine.updateEnd(time));
  }

  renderBegin(time: Phaser.Time) {
    for (let engine of this.engines) {
      engine.renderBegin(time);
    }
  }

  renderEnd(time: Phaser.Time) {
    asSequence(this.engines).reverse().forEach(engine => engine.renderEnd(time));
  }
}

export default SystemEnginesEngine;
