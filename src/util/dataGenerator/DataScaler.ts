import DataTransformer from './DataTransformer';

class DataScaler implements DataTransformer {
  constructor(private offset: number, private base: number, private scale: number) {
  }

  static between(min: number, max: number) {
    this.validateMinMax(min, max);
    return new DataScaler(0, min, max - min);
  }

  static map(fromMin: number, fromMax: number, toMin: number, toMax: number) {
    this.validateMinMax(fromMin, fromMax);
    this.validateMinMax(toMin, toMax);

    let scale = (toMax - toMin) / (fromMax - fromMin);
    return new DataScaler(fromMin, toMin, scale);
  }

  private static validateMinMax(min: number, max: number) {
    if (min > max) {
      throw new TypeError('Min is greater than max');
    }
  }

  transform(data: number) {
    return (data - this.offset) * this.scale + this.base;
  }
}

export default DataScaler;
