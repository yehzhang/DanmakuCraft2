const {verify, NotBeforeError, TokenExpiredError, JsonWebTokenError} = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    const result = verifyRequest(req);
    if (result == null) {
      return next();
    }
    return res.badRequest(req.__(result));
  } catch (e) {
    return res.serverError(e);
  }
};

/**
 * @return {string|null}
 */
function verifyRequest(req) {
  const nextCreationToken = req.param('nextCreationToken');
  try {
    verify(
      nextCreationToken,
      sails.config.keys.nextCommentCreation,
      TokenUtils.getNextCommentCreationConfig(req));
  } catch (e) {
    if (e instanceof NotBeforeError) {
      return 'error.comment.creation.tooOften';
    }
    if (e instanceof TokenExpiredError) {
      return 'error.comment.creation.expired';
    }
    if (e instanceof JsonWebTokenError) {
      return 'error.comment.creation.tokenError';
    }
    throw e;
  }

  return null;
}
