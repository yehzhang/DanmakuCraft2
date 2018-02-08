import SystemEngine from '../SystemEngine';
import TickSystem from '../../entitySystem/system/tick/TickSystem';
import {OnOrBuildClause} from './tickEngineBuilderLanguage';
import TickEngineBuilder from './TickEngineBuilder';

class TickEngine implements SystemEngine {
  constructor(private onUpdateTickers: Ticker[], private onRenderTickers: Ticker[]) {
  }

  static newBuilder() {
    return new OnOrBuildClause(new TickEngineBuilder());
  }

  updateBegin(time: Phaser.Time) {
    for (let ticker of this.onUpdateTickers) {
      ticker.tickBegin(time);
    }
  }

  updateEnd(time: Phaser.Time) {
    for (let ticker of this.onUpdateTickers) {
      ticker.tickEnd(time);
    }
  }

  renderBegin(time: Phaser.Time) {
    for (let ticker of this.onRenderTickers) {
      ticker.tickBegin(time);
    }
  }

  renderEnd(time: Phaser.Time) {
    for (let ticker of this.onRenderTickers) {
      ticker.tickEnd(time);
    }
  }
}

export default TickEngine;

export interface Ticker {
  tickBegin(time: Phaser.Time): void;

  tickEnd(time: Phaser.Time): void;
}

export class BeginTicker implements Ticker {
  constructor(private system: TickSystem) {
  }

  tickBegin(time: Phaser.Time) {
    this.system.tick(time);
  }

  tickEnd(time: Phaser.Time) {
  }
}

export class EndTicker implements Ticker {
  constructor(private system: TickSystem) {
  }

  tickBegin(time: Phaser.Time) {
  }

  tickEnd(time: Phaser.Time) {
    this.system.tick(time);
  }
}
