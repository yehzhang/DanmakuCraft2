const {sign} = require('jsonwebtoken');

module.exports = function (req, res, next) {
  req.nextCommentCreationToken =
    sign({}, sails.config.keys.nextCommentCreation, TokenUtils.getNextCommentCreationConfig(req));
  return next();
};
