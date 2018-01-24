const MAX_COMMENTS_COUNT = 15000;

module.exports = {
  async find(request, response) {
    return catchServerError(response, async () => {
      let commentsCount = parseInt(request.param('count'), 10);
      if (isNaN(commentsCount)) {
        commentsCount = MAX_COMMENTS_COUNT;
      } else {
        commentsCount = Math.max(Math.min(commentsCount, MAX_COMMENTS_COUNT), 0);
      }

      let comments = await Comment.findLatestData(commentsCount);

      if (request.isSocket) {
        // TODO watch only if there are not too many watchers already.
        Comment.watch(request);
      }

      return response.ok(comments);
    });
  },

  async create(request, response) {
    return catchServerError(response, async () => {
      let commentData;
      try {
        commentData = parseCommentDataFrom(request);
      } catch (e) {
        if (e instanceof ParameterError) {
          return response.badRequest(request.__(e.message));
        }
        throw e;
      }

      let comment = await Comment.create(commentData);

      Comment.publishCreate(comment);

      return response.ok();
    });
  },
};

async function catchServerError(response, callback) {
  try {
    return await callback();
  } catch (e) {
    return response.serverError(e);
  }
}

function parseCommentDataFrom(request) {
  let text = request.param('text');
  // TODO sanitize invalid or sensitive characters?
  if (typeof text !== 'string') {
    throw new ParameterError('error.comment.text');
  }
  if (text.length === 0) {
    throw new ParameterError('error.comment.text.empty');
  }
  if (text.length > 220) {
    throw new ParameterError('error.comment.text.long');
  }
  // No need to strip whitespaces as they allow players to better format their comments.

  return {
    text,
    color: parseValidatedIntFrom(request.param('color'), 'error.comment.color', 0, 0xffffff),
    size: parseValidatedIntFrom(request.param('size'), 'error.comment.size', 1, 72),
    coordinateX: parseValidatedIntFrom(request.param('coordinateX'), 'error.comment.coordinate'),
    coordinateY: parseValidatedIntFrom(request.param('coordinateY'), 'error.comment.coordinate'),
  };
}

function parseValidatedIntFrom(string, errorMessage, minValue, maxValue) {
  if (maxValue == null) {
    maxValue = Infinity;
  }
  if (minValue == null) {
    minValue = -Infinity;
  }

  let value = parseInt(string, 10);
  if (value >= minValue && value <= maxValue) {
    return value;
  }
  throw new ParameterError(errorMessage);
}

class ParameterError extends TypeError {
  constructor() {
    // noinspection JSCheckFunctionSignatures
    super(...arguments);
  }
}
