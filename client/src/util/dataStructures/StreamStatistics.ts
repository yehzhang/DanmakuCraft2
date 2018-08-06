class StreamStatistics {
  constructor(
      private count = 0,
      private sum = 0,
      private squaredSum = 0) {
  }

  push(value: number): this {
    this.count++;
    this.sum += value;
    this.squaredSum += value * value;

    return this;
  }

  getMean(): number {
    if (this.count === 0) {
      return 0;
    }
    return this.sum / this.count;
  }

  getVariance(): number {
    if (this.count === 0) {
      return 0;
    }
    return this.squaredSum / this.count - (this.sum / this.count) ** 2;
  }

  getStandardDeviation(): number {
    return Math.sqrt(this.getVariance());
  }

  getPredictionIntervalEndpoint(zValue: number): number {
    return this.getMean() + this.getStandardDeviation() * zValue;
  }
}

export default StreamStatistics;
