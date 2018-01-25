class FrontendConfig {
  constructor(
      readonly baseUrl: string,
      readonly commentIdentity: string,
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
      private commentIdentity?: string,
      private gameContainerId?: string) {
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  setCommentIdentity(commentIdentity: string) {
    this.commentIdentity = commentIdentity;
    return this;
  }

  setGameContainer(gameContainerId: string) {
    this.gameContainerId = gameContainerId;
    return this;
  }

  build(): FrontendConfig {
    return new FrontendConfig(
        this.validate('baseUrl'),
        this.validate('commentIdentity'),
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
