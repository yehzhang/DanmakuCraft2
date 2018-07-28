import DataTransformer from './DataTransformer';

class Scaler implements DataTransformer {
  constructor(
      private readonly offset: number,
      private readonly base: number,
      private readonly scale: number) {
  }

  static to(min: number, max: number) {
    return this.map(0, 1, min, max);
  }

  static from(min: number, max: number) {
    return this.map(min, max, 0, 1);
  }

  static map(fromMin: number, fromMax: number, toMin: number, toMax: number) {
    validateMinMax(fromMin, fromMax);
    validateMinMax(toMin, toMax);

    const scale = (toMax - toMin) / (fromMax - fromMin);
    return new Scaler(fromMin, toMin, scale);
  }

  transform(data: number) {
    return (data - this.offset) * this.scale + this.base;
  }
}

function validateMinMax(min: number, max: number) {
  if (min > max) {
    throw new TypeError('Min is greater than max');
  }
}

export default Scaler;
