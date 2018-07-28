import DataGenerator from './DataGenerator';

class SeedableDataGenerator implements DataGenerator {
  constructor(private readonly dataGenerator: Phaser.RandomDataGenerator) {
  }

  next() {
    return this.dataGenerator.frac();
  }
}

export default SeedableDataGenerator;
