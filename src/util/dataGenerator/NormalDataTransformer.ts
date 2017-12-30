import * as gaussian from 'gaussian';
import {Gaussian} from 'gaussian';
import DataTransformer from './DataTransformer';

/**
 * Maps a number to the range [0, 1), close to 0.
 */
class NormalDataTransformer implements DataTransformer {
  constructor(private distribution: Gaussian = gaussian(0, 1)) {
  }

  transform(data: number) {
    return this.distribution.ppf(data);
  }
}

export default NormalDataTransformer;
