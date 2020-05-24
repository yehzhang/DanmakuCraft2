import devApplicationId from './dev/applicationId.json';
import devServerUrl from './dev/serverUrl.json';
import prodApplicationId from './prod/applicationId.json';
import prodServerUrl from './prod/serverUrl.json';

function getAppConfig(env: 'prod' | 'dev'): AppConfig {
  switch (env) {
    case 'prod':
      return {
        applicationId: prodApplicationId,
        serverUrl: prodServerUrl,
      };
    case 'dev':
      return {
        applicationId: devApplicationId,
        serverUrl: devServerUrl,
      };
  }
}

interface AppConfig {
  readonly applicationId: string;
  readonly serverUrl: string;
}

export default getAppConfig;
