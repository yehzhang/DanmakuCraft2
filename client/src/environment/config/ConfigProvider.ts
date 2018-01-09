import ApiConfig from './ApiConfig';

class ConfigProvider {
  private static apiConfig?: ApiConfig;

  static set(apiConfig: ApiConfig) {
    this.apiConfig = apiConfig;
  }

  static get(): ApiConfig {
    if (this.apiConfig == null) {
      throw new TypeError('ApiConfig is not set');
    }
    return this.apiConfig;
  }
}

export default ConfigProvider;
