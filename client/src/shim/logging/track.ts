import mixpanel from 'mixpanel-browser';

function track(message: string, dimensions: Record<string, unknown>) {
  mixpanel.track(message, {
    ...dimensions,
    _env: __DEV__ ? 'dev' : 'prod',
  });
}

export default track;
