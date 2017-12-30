import DataGenerator from './DataGenerator';
import DataTransformer from './DataTransformer';

class ChainingDataGenerator<T> implements DataGenerator<T> {
  constructor(
      private source: DataGenerator<any>, private pipers: Array<DataTransformer<any>>) {
  }

  static newBuilder<T>(source: DataGenerator<T>): ChainingDataGeneratorBuilder<T> {
    return new ChainingDataGeneratorBuilder(source);
  }

  next() {
    return this.pipers.reduce((data, piper) => piper.transform(data), this.source.next());
  }
}

export default ChainingDataGenerator;

class ChainingDataGeneratorBuilder<T> {
  constructor(
      private source: DataGenerator<any>,
      private pipers: Array<DataTransformer<any>> = []) {
  }

  pipe<U>(piper: DataTransformer<T, U>): ChainingDataGeneratorBuilder<U> {
    return new ChainingDataGeneratorBuilder(this.source, this.pipers.concat(piper));
  }

  build(): ChainingDataGenerator<T> {
    return new ChainingDataGenerator(this.source, this.pipers);
  }
}
