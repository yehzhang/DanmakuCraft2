import getAppConfig from '../../../../backend/config/getAppConfig';

export const javaScriptKey = __DEV__
  ? 'z6FeA6kRsDJKvLXMzTMwbWRB07Ioxa3hmFVQyRFU'
  : '5Zfjq6zZHrIDR8scvgdebjqTMdbKVDWjzK695Ycm';

export const { applicationId, serverUrl } = getAppConfig(__DEV__ ? 'dev' : 'prod');
