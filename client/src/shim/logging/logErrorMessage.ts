import { track } from 'mixpanel-browser';

function logErrorMessage(message: string, details?: { readonly [key: string]: unknown }) {
  if (__DEV__) {
    console.error(message, details);
    return;
  }
  track('error', {
    ...(details && serializeObjectAttributes(details)),
    _errorMessage: message,
  });
}

function serializeObjectAttributes(attributes: object): { [key: string]: string } {
  return Object.entries(attributes).reduce(
    (details, [key, value]) =>
      Object.assign(details, { [`__${key}`]: value instanceof Date ? value.toISOString() : value }),
    {}
  );
}

export default logErrorMessage;
