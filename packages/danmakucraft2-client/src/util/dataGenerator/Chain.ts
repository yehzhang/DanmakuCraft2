import DataGenerator from './DataGenerator';
import DataTransformer from './DataTransformer';

class Chain<T, U> {
  constructor(protected pipers: Array<DataTransformer<any>>) {
  }

  static total<T = number>(generator: DataGenerator<T>): GeneratorChainBuilder<T, T> {
    return new GeneratorChainBuilder(generator);
  }

  static partial<T = number>(): TransformerChainBuilder<T, T> {
    return new TransformerChainBuilder();
  }

  protected pipe(data: T): U {
    return this.pipers.reduce((acc, piper) => piper.transform(acc), data);
  }
}

export default Chain;

class TransformerChainBuilder<T, U> {
  constructor(private pipers: Array<DataTransformer<any>> = []) {
  }

  pipe<V>(piper: DataTransformer<U, V>): TransformerChainBuilder<T, V> {
    return new TransformerChainBuilder(this.pipers.concat(piper));
  }

  build(): TransformerChain<T, U> {
    return new TransformerChain(this.pipers);
  }
}

class GeneratorChainBuilder<T, U> {
  constructor(
      private generator: DataGenerator<T>, private pipers: Array<DataTransformer<any>> = []) {
  }

  pipe<V>(piper: DataTransformer<U, V>): GeneratorChainBuilder<T, V> {
    return new GeneratorChainBuilder(this.generator, this.pipers.concat(piper));
  }

  build(): GeneratorChain<T, U> {
    return new GeneratorChain(this.generator, this.pipers);
  }
}

class TransformerChain<T, U> extends Chain<T, U> implements DataTransformer<T, U> {
  transform(data: T) {
    return this.pipe(data);
  }
}

class GeneratorChain<T, U> extends Chain<T, U> implements DataGenerator<U> {
  constructor(private generator: DataGenerator<T>, pipers: Array<DataTransformer<any>>) {
    super(pipers);
  }

  next() {
    return this.pipe(this.generator.next());
  }
}
