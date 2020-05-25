import Parse from 'parse';
import devApplicationId from '../../../../parse/config/dev/applicationId.json';
import devServerUrl from '../../../../parse/config/dev/serverUrl.json';
import prodApplicationId from '../../../../parse/config/prod/applicationId.json';
import prodServerUrl from '../../../../parse/config/prod/serverUrl.json';

function initializeBackend() {
  const javaScriptKey = __DEV__
    ? 'z6FeA6kRsDJKvLXMzTMwbWRB07Ioxa3hmFVQyRFU'
    : '5Zfjq6zZHrIDR8scvgdebjqTMdbKVDWjzK695Ycm';
  Parse.initialize(__DEV__ ? devApplicationId : prodApplicationId, javaScriptKey);
  Parse.serverURL = __DEV__ ? devServerUrl : prodServerUrl;
}

export default initializeBackend;
