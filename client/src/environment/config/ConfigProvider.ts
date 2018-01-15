import BackendConfig from './BackendConfig';

class ConfigProvider {
  private static config?: BackendConfig;

  static set(apiConfig: BackendConfig) {
    this.config = apiConfig;
  }

  static get(): BackendConfig {
    if (this.config == null) {
      throw new TypeError('BackendConfig is not set');
    }
    return this.config;
  }
}

export default ConfigProvider;
