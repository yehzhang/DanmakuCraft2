import Parse from 'parse';
import getAppConfig from '../../../../backend/config/getAppConfig';

function initializeBackend() {
  const javaScriptKey = __DEV__
    ? 'z6FeA6kRsDJKvLXMzTMwbWRB07Ioxa3hmFVQyRFU'
    : '5Zfjq6zZHrIDR8scvgdebjqTMdbKVDWjzK695Ycm';
  Parse.initialize(appConfig.applicationId, javaScriptKey);
  Parse.serverURL = appConfig.serverUrl;
}

export const appConfig = getAppConfig(__DEV__ ? 'dev' : 'prod');

export default initializeBackend;
