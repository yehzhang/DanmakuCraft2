import DataGenerator from './DataGenerator';

class Joining<TAll> implements DataGenerator<TAll[]> {
  constructor(private generators: Array<DataGenerator<TAll>>) {
  }

  static of<TAll>(...generators: Array<DataGenerator<TAll>>): Joining<TAll> {
    return new Joining(Array.from(generators));
  }

  next() {
    return this.generators.map(generator => generator.next());
  }
}

export default Joining;
