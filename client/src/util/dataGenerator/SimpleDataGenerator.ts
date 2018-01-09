import DataGenerator from './DataGenerator';

class SimpleDataGenerator implements DataGenerator {
  next() {
    return Phaser.Math.random(0, 1);
  }
}

export default SimpleDataGenerator;
