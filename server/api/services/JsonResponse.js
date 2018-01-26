const {inspect} = require('util');

module.exports = {
  wrapErrorData(data) {
    let reason;
    if (typeof data === 'string') {
      reason = data;
    } else {
      reason = inspect(data, {depth: null});
    }

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
  /**
   * @param {string} reason
   */
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
