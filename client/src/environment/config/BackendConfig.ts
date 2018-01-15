class BackendConfig {
  constructor(
      readonly baseUrl: string,
      readonly batchCommentsPath: string,
      readonly defaultBatchCommentsPath: string,
      readonly newCommentBroadcastPath: string,
      readonly gameContainerId: string,
      readonly officialWebsiteHostname: string) {
  }

  static newBuilder() {
    return new BackendConfigBuilder();
  }
}

export default BackendConfig;

class BackendConfigBuilder {
  constructor(
      private baseUrl?: string,
      private batchCommentsPath?: string,
      private defaultBatchCommentsPath?: string,
      private newCommentBroadcastPath?: string,
      private gameContainerId?: string,
      private officialWebsiteHostname?: string) {
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  setBatchCommentsPath(batchCommentsPath: string) {
    this.batchCommentsPath = batchCommentsPath;
    return this;
  }

  setNewCommentBroadcastPath(newCommentBroadcastPath: string) {
    this.newCommentBroadcastPath = newCommentBroadcastPath;
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

  setOfficialWebsiteHostname(officialWebsiteHostname: string) {
    this.officialWebsiteHostname = officialWebsiteHostname;
    return this;
  }

  build(): BackendConfig {
    return new BackendConfig(
        this.validate('baseUrl'),
        this.validate('batchCommentsPath'),
        this.validate('defaultBatchCommentsPath'),
        this.validate('newCommentBroadcastPath'),
        this.validate('gameContainerId'),
        this.validate('officialWebsiteHostname'));
  }

  validate(fieldName: keyof BackendConfig): any {
    let field = (this as any)[fieldName];
    if (field == null) {
      throw new TypeError(`Field ${fieldName} is missing`);
    }
    return field;
  }
}
