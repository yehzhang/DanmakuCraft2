import DataTransformer from './DataTransformer';

class Clamper implements DataTransformer {
  constructor(private min: number, private max: number) {
  }

  transform(data: number) {
    return Math.max(Math.min(data, this.max), this.min);
  }
}

export default Clamper;
