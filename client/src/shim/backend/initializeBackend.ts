import Parse from 'parse';
import getAppConfig from '../../../../backend/config/getAppConfig';

function initializeBackend() {
  Parse.initialize(applicationId, javaScriptKey);
  Parse.serverURL = serverUrl;
}

export const javaScriptKey = __DEV__
  ? 'z6FeA6kRsDJKvLXMzTMwbWRB07Ioxa3hmFVQyRFU'
  : '5Zfjq6zZHrIDR8scvgdebjqTMdbKVDWjzK695Ycm';

export const { applicationId, serverUrl } = getAppConfig(__DEV__ ? 'dev' : 'prod');

export default initializeBackend;
