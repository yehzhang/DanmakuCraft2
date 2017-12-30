import DataGenerator from './DataGenerator';

interface DataGeneratorFactory {
  getColorTransitionSpeedGenerator(): DataGenerator;
}

export default DataGeneratorFactory;
