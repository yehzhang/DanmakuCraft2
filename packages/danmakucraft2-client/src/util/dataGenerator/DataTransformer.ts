interface DataTransformer<T = number, U = T> {
  transform(data: T): U;
}

export default DataTransformer;
