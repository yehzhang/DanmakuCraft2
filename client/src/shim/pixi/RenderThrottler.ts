import { Ticker } from '@pixi/ticker';
import { StreamStatistics } from '../../data/stats';

class RenderThrottler {
  private readonly runnerTimeEstimator = new StreamStatistics();

  constructor() {
    this.runnerTimeEstimator.push(1);
  }

  /**
   * Calls {@param runner} if there is enough time left in this tick.
   *
   * @param reservedMsAfterRunner
   * @return whether {@param runner} is called.
   */
  run(runner: () => void, reservedMsAfterRunner: number): boolean {
    const now = performance.now();

    const msPerTick = 1000 / desiredFps;
    if (consecutiveThrottlingCount > maxConsecutiveThrottlingCount) {
      this.runAndUpdateEstimator(runner, now, msPerTick);

      consecutiveThrottlingCount--;

      return true;
    }

    const lastTickedMs = Ticker.shared.lastTime;
    const msSinceTickStart = now - lastTickedMs;
    const msLeftForRunner = msPerTick - msSinceTickStart - reservedMsAfterRunner;
    if (msLeftForRunner <= 0) {
      consecutiveThrottlingCount++;
      return false;
    }

    const predictedRunnerTime = this.runnerTimeEstimator.getPredictionIntervalEndpoint(
      runnerTimePredictionZValue
    );
    if (msLeftForRunner - predictedRunnerTime <= 0) {
      consecutiveThrottlingCount++;

      this.runnerTimeEstimator.push(0);

      return false;
    }

    this.runAndUpdateEstimator(runner, now, msPerTick);

    consecutiveThrottlingCount = -1;

    return true;
  }

  private runAndUpdateEstimator(runner: () => void, runStartTime: number, msPerTick: number) {
    runner();

    const cappedRunnerTime = Math.min(performance.now() - runStartTime, msPerTick);
    this.runnerTimeEstimator.push(cappedRunnerTime);
  }
}

let consecutiveThrottlingCount = 0;

// The maximum FPS that the throttler tries to guarantee. The higher the value, the more likely a
// runner is not called.
const desiredFps = 60;
// The number of consecutive frames the throttler can throttle before it ceases to do so.
const maxConsecutiveThrottlingCount = 120;
const runnerTimePredictionZValue = 1;

export default RenderThrottler;
