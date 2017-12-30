import DataGeneratorFactory from './DataGeneratorFactory';
import ChainingDataGenerator from './ChainingDataGenerator';
import SimpleDataGenerator from './SimpleDataGenerator';
import DataScaler from './DataScaler';
import NormalDataTransformer from './NormalDataTransformer';
import DataGenerator from './DataGenerator';
import * as gaussian from 'gaussian';

class DataGeneratorFactoryImpl implements DataGeneratorFactory {
  private static NORMAL_DATA_GENERATOR_DATA_LIMIT = 0.000001;

  constructor(private colorTransitionSpeedGeneratorInstance: DataGenerator | null = null) {
  }

  /**
   * Distribution is within the range [0, 5), skewed to the center.
   */
  private static createColorTransitionSpeedGenerator() {
    let [minInput, maxInput] = this.getNormalDataInputMinMax();
    let normalTransformer = new NormalDataTransformer(gaussian(0, 0.5));
    const averageSpeed = 1.5; // TODO depends on user id
    return ChainingDataGenerator.newBuilder(new SimpleDataGenerator())
        .pipe(DataScaler.between(minInput, maxInput))
        .pipe(normalTransformer)
        .pipe(DataScaler.map(
            normalTransformer.transform(minInput),
            normalTransformer.transform(maxInput),
            0,
            averageSpeed * 2))
        .build();
  }

  private static getNormalDataInputMinMax() {
    return [this.NORMAL_DATA_GENERATOR_DATA_LIMIT, 1 - this.NORMAL_DATA_GENERATOR_DATA_LIMIT];
  }

  getColorTransitionSpeedGenerator() {
    if (this.colorTransitionSpeedGeneratorInstance == null) {
      this.colorTransitionSpeedGeneratorInstance =
          DataGeneratorFactoryImpl.createColorTransitionSpeedGenerator();
    }
    return this.colorTransitionSpeedGeneratorInstance;
  }
}

export default DataGeneratorFactoryImpl;
