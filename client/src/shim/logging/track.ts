import transform from 'lodash/transform';
import mixpanel from 'mixpanel-browser';

function track(message: string, dimensions: Record<string, unknown>) {
  mixpanel.track(
    message,
    serializeObjectAttributes({
      ...dimensions,
      env: __DEV__ ? 'dev' : 'prod',
    })
  );
}

function serializeObjectAttributes(attributes: Record<string, unknown>): Record<string, unknown> {
  return transform(
    attributes,
    (result, value, key) =>
      void (result[`_${key}`] = value instanceof Date ? value.toISOString() : value)
  );
}

mixpanel.init('c0ec520e4eda0a1acb3728101f995335');

export default track;
