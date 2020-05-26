import { set } from 'parse/lib/browser/CoreManager';
import getAppConfig from '../../../../parse/config/getAppConfig';

function initializeBackend() {
  set('APPLICATION_ID', appConfig.applicationId);
  set(
    'JAVASCRIPT_KEY',
    __DEV__
      ? 'z6FeA6kRsDJKvLXMzTMwbWRB07Ioxa3hmFVQyRFU'
      : '5Zfjq6zZHrIDR8scvgdebjqTMdbKVDWjzK695Ycm'
  );
  set('SERVER_URL', appConfig.serverUrl);
}

export const appConfig = getAppConfig(__DEV__ ? 'dev' : 'prod');

export default initializeBackend;
