import SystemEngine from './SystemEngine';

class EngineCap {
  constructor(private engine: SystemEngine, private time: Phaser.Time) {
  }

  update() {
    this.engine.updateEnd(this.time);
    this.engine.updateBegin(this.time);
  }

  render() {
    this.engine.renderEnd(this.time);
    this.engine.renderBegin(this.time);
  }
}

export default EngineCap;
