import FrontendConfig from './FrontendConfig';

class ConfigProvider {
  private static config?: FrontendConfig;

  static set(apiConfig: FrontendConfig) {
    this.config = apiConfig;
  }

  static get(): FrontendConfig {
    if (this.config == null) {
      throw new TypeError('FrontendConfig is not set');
    }
    return this.config;
  }
}

export default ConfigProvider;
