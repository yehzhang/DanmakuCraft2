import TickEngine, {Ticker} from './TickEngine';

class TickEngineBuilder {
  constructor(
      private readonly onUpdateTickers: Ticker[] = [],
      private readonly onRenderTickers: Ticker[] = []) {
  }

  apply(ticker: Ticker, onUpdate: boolean) {
    let tickers;
    if (onUpdate) {
      tickers = this.onUpdateTickers;
    } else {
      tickers = this.onRenderTickers;
    }

    tickers.push(ticker);
  }

  build() {
    return new TickEngine(this.onUpdateTickers, this.onRenderTickers);
  }
}

export default TickEngineBuilder;
