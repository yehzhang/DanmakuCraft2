import mapKeys from 'lodash/mapKeys';
import track from './track';

function trackError(message: string, stackTrace: string | undefined, details?: ErrorDetails) {
  track('Error', {
    ...(details && mapKeys(details, (value, key) => `_${key}`)),
    errorMessage: message,
    stackTrace,
  });
}

type ErrorDetails = Record<string, unknown>;

export default trackError;
