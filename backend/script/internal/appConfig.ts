import devMasterKey from '../../config/dev/masterKey.json';
import getAppConfig from '../../config/getAppConfig';
import prodMasterKey from '../../config/prod/masterKey.json';

const appConfig = (() => {
  if (process.env.ENV === 'prod') {
    console.log('Using prod environment');
    return {
      ...getAppConfig('prod'),
      masterKey: prodMasterKey,
    };
  }
  if (process.env.ENV === 'dev') {
    console.log('Using dev environment');
    return {
      ...getAppConfig('dev'),
      masterKey: devMasterKey,
    };
  }
  throw new TypeError('Expected environment dev or prod');
})();

export default appConfig;
