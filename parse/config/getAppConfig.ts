import devApplicationId from './dev/applicationId.json';
import devMasterKey from './dev/masterKey.json';
import devServerUrl from './dev/serverUrl.json';
import prodApplicationId from './prod/applicationId.json';
import prodMasterKey from './prod/masterKey.json';
import prodServerUrl from './prod/serverUrl.json';

function getAppConfig(env: 'prod' | 'dev'): AppConfig {
  switch (env) {
    case 'prod':
      return {
        applicationId: prodApplicationId,
        masterKey: prodMasterKey,
        serverUrl: prodServerUrl,
      };
    case 'dev':
      return {
        applicationId: devApplicationId,
        masterKey: devMasterKey,
        serverUrl: devServerUrl,
      };
  }
}

interface AppConfig {
  readonly applicationId: string;
  readonly masterKey: string;
  readonly serverUrl: string;
}

export default getAppConfig;
