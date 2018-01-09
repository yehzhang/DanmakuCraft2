import DataGenerator from '../util/dataGenerator/DataGenerator';

class ColorTransitionLaw {
  constructor(
      readonly speedStrategy: DataGenerator<number>,
      readonly pauseStrategy: DataGenerator<boolean>,
      readonly pauseIntervalStrategy: DataGenerator<number>) {
  }
}

export default ColorTransitionLaw;
