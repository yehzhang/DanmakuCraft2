module.exports = {
  /**
   * @param {Request} req
   * @return {boolean}
   */
  isDanmakucraftHostname(req) {
    return req.hostname === sails.config.hostname;
  },
};
