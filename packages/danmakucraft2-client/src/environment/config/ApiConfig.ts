class ApiConfig {
  constructor(
      readonly baseUrl: string,
      readonly batchCommentsPath: string,
      readonly defaultBatchCommentsPath: string,
      readonly newCommentBroadcastPath: string) {
  }

  static newBuilder() {
    return new ApiConfigBuilder();
  }
}

export default ApiConfig;

class ApiConfigBuilder {
  constructor(
      private baseUrl?: string,
      private batchCommentsPath?: string,
      private defaultBatchCommentsPath?: string,
      private newCommentBroadcastPath?: string) {
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

  build(): ApiConfig {
    return new ApiConfig(
        this.validate('baseUrl'),
        this.validate('batchCommentsPath'),
        this.validate('defaultBatchCommentsPath'),
        this.validate('newCommentBroadcastPath'));
  }

  validate(fieldName: keyof ApiConfig): any {
    let field = (this as any)[fieldName];
    if (field == null) {
      throw new TypeError(`Field ${fieldName} is missing`);
    }
    return field;
  }
}
