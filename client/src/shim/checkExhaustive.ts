import ParametricTypeError from './logging/ParametricTypeError';

function checkExhaustive(value: never): never {
  throw new ParametricTypeError('Expected exhaustive check', { value });
}

export default checkExhaustive;
