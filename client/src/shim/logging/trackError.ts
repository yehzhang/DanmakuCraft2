import track from './track';

function trackError(message: string, stackTrace: string | undefined, details?: ErrorDetails) {
  track('Error', {
    ...(details && serializeObjectAttributes(details)),
    _errorMessage: message,
    _stackTrace: stackTrace,
  });
}

export interface ErrorDetails {
  readonly [key: string]: unknown;
}

function serializeObjectAttributes(attributes: object): { [key: string]: string } {
  return Object.entries(attributes).reduce(
    (details, [key, value]) =>
      Object.assign(details, { [`__${key}`]: value instanceof Date ? value.toISOString() : value }),
    {}
  );
}

export default trackError;
