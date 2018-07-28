import FrontendConfig from './FrontendConfig';

class ConfigProvider {
  static set(apiConfig: FrontendConfig) {
    config = apiConfig;
  }

  static get(): FrontendConfig {
    if (!config) {
      throw new TypeError('FrontendConfig is not set');
    }
    return config;
  }
}

let config: FrontendConfig | null = null;

export default ConfigProvider;
