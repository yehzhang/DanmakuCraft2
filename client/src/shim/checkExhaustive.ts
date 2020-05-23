import ParametricTypeError from './ParametricTypeError';

function checkExhaustive(value: never): never {
  throw new ParametricTypeError('Unexpected inexhaustive check', { value });
}

export default checkExhaustive;
