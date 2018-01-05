import * as gaussian from 'gaussian';
import {Gaussian} from 'gaussian';
import DataTransformer from './DataTransformer';
import Capped from './Capped';

/**
 * Maps a number to the range [0, 1), close to 0.
 */
class Normal implements DataTransformer {
  private static NORMAL_DATA_GENERATOR_DATA_LIMIT = 0.000001;

  constructor(private distribution: Gaussian = gaussian(0, 1)) {
  }

  static capped(distribution: Gaussian, limit: number = this.NORMAL_DATA_GENERATOR_DATA_LIMIT) {
    return Capped.by(limit, new this(distribution));
  }

  transform(data: number) {
    return this.distribution.ppf(data);
  }
}

export default Normal;
