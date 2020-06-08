import trackError from './trackError';

function logErrorMessage(message: string, details?: { readonly [key: string]: unknown }) {
  if (__DEV__) {
    if (details === undefined) {
      console.error(message);
    } else {
      console.error(message, details);
    }
  }

  const stackTrace = new Error().stack;
  trackError(message, stackTrace, details);
}

export default logErrorMessage;
