import logErrorMessage from './logErrorMessage';
import ParametricTypeError from './ParametricTypeError';

function logError(error: Error) {
  logErrorMessage(error.message, error instanceof ParametricTypeError ? error.details : undefined);
}

export default logError;
