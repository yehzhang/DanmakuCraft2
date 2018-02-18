module.exports = {
  async catchServerError(res, callback) {
    try {
      return await callback();
    } catch (e) {
      return res.serverError(e);
    }
  },
};
