import track from './track';

function trackError(message: string, stackTrace: string | undefined, details?: ErrorDetails) {
  track('Error', {
    ...(details && prefixErrorDetails(details)),
    errorMessage: message,
    stackTrace,
  });
}

type ErrorDetails = Record<string, unknown>;

function prefixErrorDetails(attributes: ErrorDetails): ErrorDetails {
  return Object.entries(attributes).reduce(
    (details, [key, value]) => Object.assign(details, { [`_${key}`]: value }),
    {}
  );
}

export default trackError;
