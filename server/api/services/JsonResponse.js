module.exports = {
  wrapErrorData(reason) {
    return new ErrorResponseData(reason);
  },

  wrapValueData(value) {
    return new ValueResponseData(value);
  },
};

class ResponseData {
  constructor(status) {
    this.status = status;
  }
}

class ErrorResponseData extends ResponseData {
  constructor(reason) {
    super('rejected');
    this.reason = reason;
  }
}

class ValueResponseData extends ResponseData {
  constructor(value) {
    super('resolved');
    this.value = value;
  }
}
