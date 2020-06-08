import mixpanel from 'mixpanel-browser';

function track(message: string, dimensions: Record<string, unknown>) {
  mixpanel.track(message, {
    ...dimensions,
    _env: __DEV__ ? 'dev' : 'prod',
  });
}

mixpanel.init('c0ec520e4eda0a1acb3728101f995335');

export default track;
