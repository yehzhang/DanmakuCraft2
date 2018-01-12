import SystemEngine from './SystemEngine';

class SystemEnginesEngine<T extends SystemEngine> implements SystemEngine {
  constructor(private engines: T[]) {
  }

  update() {
    for (let engine of this.engines) {
      engine.update();
    }
  }

  render() {
    for (let engine of this.engines) {
      engine.render();
    }
  }
}

export default SystemEnginesEngine;
