import DataTransformer from './DataTransformer';

class Scaler implements DataTransformer {
  constructor(private offset: number, private base: number, private scale: number) {
  }

  static to(min: number, max: number) {
    return this.map(0, 1, min, max);
  }

  static from(min: number, max: number) {
    return this.map(min, max, 0, 1);
  }

  static map(fromMin: number, fromMax: number, toMin: number, toMax: number) {
    this.validateMinMax(fromMin, fromMax);
    this.validateMinMax(toMin, toMax);

    let scale = (toMax - toMin) / (fromMax - fromMin);
    return new Scaler(fromMin, toMin, scale);
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

export default Scaler;
