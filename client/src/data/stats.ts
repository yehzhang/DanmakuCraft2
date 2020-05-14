export function mean(a: number, b: number): number {
  return (a + b) / 2;
}

export class StreamStatistics {
  private count = 0;
  private sum = 0;
  private squaredSum = 0;

  push(value: number) {
    this.count++;
    this.sum += value;
    this.squaredSum += value * value;
  }

  private getMean(): number {
    if (this.count === 0) {
      return 0;
    }
    return this.sum / this.count;
  }

  private getVariance(): number {
    if (this.count === 0) {
      return 0;
    }
    return this.squaredSum / this.count - (this.sum / this.count) ** 2;
  }

  private getStandardDeviation(): number {
    return Math.sqrt(this.getVariance());
  }

  getPredictionIntervalEndpoint(zValue: number): number {
    return this.getMean() + this.getStandardDeviation() * zValue;
  }
}
