import ParametricTypeError from './ParametricTypeError';
import trackError from './trackError';

function logError(error: Error) {
  const details = error instanceof ParametricTypeError ? error.details : undefined;
  if (__DEV__) {
    if (details) {
      console.error(error, details);
    } else {
      console.error(error);
    }
  }

  trackError(error.message, error.stack, details);
}

export default logError;
