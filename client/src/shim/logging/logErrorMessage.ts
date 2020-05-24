import mixpanel from 'mixpanel-browser';

function logErrorMessage(message: string, details?: { readonly [key: string]: unknown }) {
  if (__DEV__) {
    if (details === undefined) {
      console.error(message);
    } else {
      console.error(message, details);
    }
    return;
  }
  mixpanel.track('Error', {
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
