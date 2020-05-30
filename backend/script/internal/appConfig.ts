import getAppConfig from '../../config/getAppConfig';

const appConfig = (() => {
  if (process.env.ENV === 'prod') {
    console.log('Using prod environment');
    return getAppConfig('prod');
  }
  if (process.env.ENV === 'dev') {
    console.log('Using dev environment');
    return getAppConfig('dev');
  }
  throw new TypeError('Expected environment dev or prod');
})();

export default appConfig;
