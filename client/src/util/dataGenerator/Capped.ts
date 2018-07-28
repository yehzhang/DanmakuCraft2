import Chain from './Chain';
import DataTransformer from './DataTransformer';
import Scaler from './Scaler';

abstract class Capped {
  static between(
      minInput: number,
      maxInput: number,
      transformer: DataTransformer): DataTransformer {
    const minOutput = transformer.transform(minInput);
    const maxOutput = transformer.transform(maxInput);
    return Chain.partial()
        .pipe(Scaler.to(minInput, maxInput))
        .pipe(transformer)
        .pipe(Scaler.map(minOutput, maxOutput, 0, 1))
        .build();
  }

  static by(transformerInputLimit: number, transformer: DataTransformer): DataTransformer {
    const minInput = transformerInputLimit;
    const maxInput = 1 - transformerInputLimit;
    return this.between(minInput, maxInput, transformer);
  }
}

export default Capped;
