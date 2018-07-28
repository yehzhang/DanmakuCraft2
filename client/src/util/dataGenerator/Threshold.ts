import DataTransformer from './DataTransformer';

class Threshold implements DataTransformer<number, boolean> {
  constructor(private readonly threshold: number = 0.5) {
  }

  static smallerThan(value: number) {
    return new this(value);
  }

  static greaterThan(value: number) {
    return new this(1 - value);
  }


  transform(data: number): boolean {
    return data < this.threshold;
  }
}

export default Threshold;
