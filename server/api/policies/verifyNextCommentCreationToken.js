const {verify, NotBeforeError} = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    if (verifyRequest(req)) {
      return next();
    }
    return res.badRequest(req.__('error.comment.creation.tooMany'));
  } catch(e) {
    return res.serverError(e);
  }
};

function verifyRequest(req) {
  try {
    verify(req.param('nextCreationToken'), sails.config.keys.nextCommentCreation);
  } catch (e) {
    if (e instanceof NotBeforeError) {
      return false;
    }
  }
  return true;
}
