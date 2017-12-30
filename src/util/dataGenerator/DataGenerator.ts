interface DataGenerator<T = number> {
  next(): T;
}

export default DataGenerator;
