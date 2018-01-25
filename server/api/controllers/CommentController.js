const MAX_COMMENTS_COUNT = 15000;
const DEFAULT_USER_ID = 0; // Unknown
const COMMENT_ROOM_ID = -1;

module.exports = {
  async find(req, res) {
    return catchServerError(res, async () => {
      let commentsCount = parseInt(req.param('count'), 10);
      if (isNaN(commentsCount)) {
        commentsCount = MAX_COMMENTS_COUNT;
      } else {
        commentsCount = Math.max(Math.min(commentsCount, MAX_COMMENTS_COUNT), 0);
      }

      let comments = await Comment.findLatestData(commentsCount);

      if (req.isSocket) {
        // TODO watch only if there are not too many watchers already.
        Comment.subscribe(req, [COMMENT_ROOM_ID]);
      }

      return res.ok(CommentUtils.wrapAsCommentFoundData(comments, req.nextCommentCreationToken));
    });
  },

  async create(req, res) {
    return catchServerError(res, async () => {
      let commentData;
      try {
        commentData = parseCommentDataFrom(req.param('comment'));
      } catch (e) {
        if (e instanceof ParameterError) {
          return res.badRequest(req.__(e.message));
        }
        throw e;
      }

      // let externalUserId = req.param('externalUserId');
      // if (typeof externalUserId === 'string') {
      //   commentData.user = findOrCreateUser(externalUserId);
      // } else {
      //   commentData.user = DEFAULT_USER_ID;
      // }

      commentData.user = DEFAULT_USER_ID;

      let flatData = await Comment.createAsFlatData(commentData);
      let createdData =
        CommentUtils.wrapAsCommentCreatedData(flatData, req.nextCommentCreationToken);

      Comment.message(COMMENT_ROOM_ID, createdData);

      return res.ok();
    });
  },
};

async function catchServerError(res, callback) {
  try {
    return await callback();
  } catch (e) {
    return res.serverError(e);
  }
}

function parseCommentDataFrom(comment) {
  if (comment == null) {
    throw new TypeError('Comment is not provided');
  }

  // TODO sanitize invalid or sensitive characters?
  if (typeof comment.text !== 'string') {
    throw new ParameterError('error.comment.text');
  }
  if (comment.text.length === 0) {
    throw new ParameterError('error.comment.text.empty');
  }
  if (comment.text.length > 220) {
    throw new ParameterError('error.comment.text.long');
  }
  // No need to strip whitespaces as they allow players to better format their comments.

  return {
    text: comment.text,
    color: parseValidatedIntFrom(comment.color, 'error.comment.color', 0, 0xffffff),
    size: parseValidatedIntFrom(comment.size, 'error.comment.size', 1, 72),
    coordinateX: parseValidatedIntFrom(comment.coordinateX, 'error.comment.coordinate'),
    coordinateY: parseValidatedIntFrom(comment.coordinateY, 'error.comment.coordinate'),
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
