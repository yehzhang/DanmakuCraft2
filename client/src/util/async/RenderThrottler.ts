import {Phaser} from '../alias/phaser';
import StreamStatistics from '../math/StreamStatistics';

class RenderThrottler {
  // The minimum fps that the throttler tries to guarantee. The higher the value, the more likely a
  // runner is not called.
  private static readonly MAX_DESIRED_FPS = 60;

  // The number of consecutive frames the throttler can throttle before it ceases to do so.
  private static readonly MAX_CONSECUTIVE_THROTTLING_COUNT = 120;

  private static readonly RUNNER_TIME_PREDICTION_Z_VALUE = 1;

  private static readonly RESERVED_TIME_AFTER_RUNNER_MS = 2;

  constructor(
      private readonly runnerTimeEstimator = new StreamStatistics().push(1),
      private consecutiveThrottlingCount = -1) {
  }

  /**
   * Calls {@param runner} if there is enough time left in this tick, according to {@param time}.
   * @param reservedTimeAfterRunner
   * @return whether {@param runner} is called.
   */
  run(
      runner: () => void,
      time: Phaser.Time,
      reservedTimeAfterRunner: number = RenderThrottler.RESERVED_TIME_AFTER_RUNNER_MS): boolean {
    const now = Date.now();

    const desiredFps = Math.min(time.desiredFps, RenderThrottler.MAX_DESIRED_FPS);
    const timePerTick = Phaser.Timer.SECOND / desiredFps;
    if (this.consecutiveThrottlingCount > RenderThrottler.MAX_CONSECUTIVE_THROTTLING_COUNT) {
      this.runAndUpdateEstimator(runner, now, timePerTick);

      this.consecutiveThrottlingCount--;

      return true;
    }

    const tickStartTime = time.time;
    const timeUsedSinceTickStart = now - tickStartTime;
    const timeLeftForRunner = timePerTick - timeUsedSinceTickStart - reservedTimeAfterRunner;
    if (timeLeftForRunner <= 0) {
      this.consecutiveThrottlingCount++;
      return false;
    }

    const predictedRunnerTime = this.runnerTimeEstimator.getPredictionIntervalEndpoint(
        RenderThrottler.RUNNER_TIME_PREDICTION_Z_VALUE);
    if (timeLeftForRunner - predictedRunnerTime <= 0) {
      this.consecutiveThrottlingCount++;

      this.runnerTimeEstimator.push(0);

      return false;
    }

    this.runAndUpdateEstimator(runner, now, timePerTick);

    this.consecutiveThrottlingCount = -1;

    return true;
  }

  private runAndUpdateEstimator(runner: () => void, runStartTime: number, timePerTick: number) {
    runner();

    const cappedRunnerTime = Math.min(Date.now() - runStartTime, timePerTick);
    this.runnerTimeEstimator.push(cappedRunnerTime);
  }
}

export default RenderThrottler;
