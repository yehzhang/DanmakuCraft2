import devApplicationId from './dev/applicationId.json';
import devMasterKey from './dev/masterKey.json';
import devServerUrl from './dev/serverUrl.json';
import prodApplicationId from './prod/applicationId.json';
import prodMasterKey from './prod/masterKey.json';
import prodServerUrl from './prod/serverUrl.json';

const config = (() => {
  if (process.env.ENV === 'prod') {
    console.log('Using prod environment');
    return {
      applicationId: prodApplicationId,
      masterKey: prodMasterKey,
      serverUrl: prodServerUrl,
    };
  }
  if (process.env.ENV === 'dev') {
    console.log('Using dev environment');
    return {
      applicationId: devApplicationId,
      masterKey: devMasterKey,
      serverUrl: devServerUrl,
    };
  }
  throw new TypeError('Expected environment dev or prod');
})();

export default config;
