class FrontendConfig {
  constructor(
      readonly baseUrl: string,
      readonly commentsPath: string,
      readonly defaultBatchCommentsPath: string,
      readonly gameContainerId: string) {
  }

  static newBuilder() {
    return new FrontendConfigBuilder();
  }
}

export default FrontendConfig;

class FrontendConfigBuilder {
  constructor(
      private baseUrl?: string,
      private commentsPath?: string,
      private defaultBatchCommentsPath?: string,
      private gameContainerId?: string) {
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  setBatchCommentsPath(commentsPath: string) {
    this.commentsPath = commentsPath;
    return this;
  }

  setDefaultBatchCommentsPath(defaultBatchCommentsPath: string) {
    this.defaultBatchCommentsPath = defaultBatchCommentsPath;
    return this;
  }

  setGameContainer(gameContainerId: string) {
    this.gameContainerId = gameContainerId;
    return this;
  }

  build(): FrontendConfig {
    return new FrontendConfig(
        this.validate('baseUrl'),
        this.validate('commentsPath'),
        this.validate('defaultBatchCommentsPath'),
        this.validate('gameContainerId'));
  }

  validate(fieldName: keyof FrontendConfig): any {
    let field = (this as any)[fieldName];
    if (field == null) {
      throw new TypeError(`Field ${fieldName} is missing`);
    }
    return field;
  }
}
