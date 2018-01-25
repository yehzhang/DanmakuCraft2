const {sign} = require('jsonwebtoken');

module.exports = function (req, res, next) {
  req.nextCommentCreationToken = sign(
    {},
    sails.config.keys.nextCommentCreation,
    {notBefore: sails.config.parameters.nextCommentCreationInterval});
  return next();
};
