import {asSequence} from 'sequency';
import TickSystem from '../../entitySystem/system/tick/TickSystem';
import SystemEngine from '../SystemEngine';
import TickEngineBuilder from './TickEngineBuilder';
import {OnOrBuildClause} from './tickEngineBuilderLanguage';

/**
 * Applies systems to all entities around an entity every tick.
 */
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
    asSequence(this.onUpdateTickers).reverse().forEach(ticker => ticker.tickEnd(time));
  }

  renderBegin(time: Phaser.Time) {
    for (let ticker of this.onRenderTickers) {
      ticker.tickBegin(time);
    }
  }

  renderEnd(time: Phaser.Time) {
    asSequence(this.onRenderTickers).reverse().forEach(ticker => ticker.tickEnd(time));
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
