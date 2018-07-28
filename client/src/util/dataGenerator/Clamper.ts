import DataTransformer from './DataTransformer';

class Clamper implements DataTransformer {
  constructor(private readonly min: number, private readonly max: number) {
  }

  transform(data: number) {
    return Math.max(Math.min(data, this.max), this.min);
  }
}

export default Clamper;
