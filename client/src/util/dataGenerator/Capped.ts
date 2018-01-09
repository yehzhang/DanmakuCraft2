import DataTransformer from './DataTransformer';
import Scaler from './Scaler';
import Chain from './Chain';

abstract class Capped {
  static between(
      minInput: number,
      maxInput: number,
      transformer: DataTransformer): DataTransformer {
    let minOutput = transformer.transform(minInput);
    let maxOutput = transformer.transform(maxInput);
    return Chain.partial()
        .pipe(Scaler.to(minInput, maxInput))
        .pipe(transformer)
        .pipe(Scaler.map(minOutput, maxOutput, 0, 1))
        .build();
  }

  static by(transformerInputLimit: number, transformer: DataTransformer): DataTransformer {
    let minInput = transformerInputLimit;
    let maxInput = 1 - transformerInputLimit;
    return this.between(minInput, maxInput, transformer);
  }
}

export default Capped;
