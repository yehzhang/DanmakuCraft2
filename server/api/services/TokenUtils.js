module.exports = {
  /**
   * @param {object} req
   * @return {object}
   */
  getNextCommentCreationConfig(req) {
    // TODO vulnerable to replay attacks from the same IP address within the token's expiration date
    // unless jwtid is verified.
    return {
      notBefore: sails.config.parameters.nextCommentCreation.interval,
      expiresIn: sails.config.parameters.nextCommentCreation.tokenExpiresIn,
      // TODO
      // jwtid: shortid.generate(),

      // issuer: `${req.host || '__UNKNOWN_REQ_HOST__'}@${sails.config.parameters.serverInstanceId}`,
      // audience: req.ip || '__UNKNOWN_REQ_IP__',
    };
  }
};
