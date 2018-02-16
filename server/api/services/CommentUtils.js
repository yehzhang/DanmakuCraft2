module.exports = {
  /**
   * @param {Comment} comment
   * @param {string} nextCreationToken
   * @return {CommentCreatedData}
   */
  wrapAsCommentCreatedData(comment, nextCreationToken) {
    return {comment: CommentUtils.asFlatData(comment), nextCreationToken};
  },

  /**
   * @param {Comment[]} comments
   * @param {string} nextCreationToken
   * @return {CommentFoundData}
   */
  wrapAsCommentFoundData(comments, nextCreationToken) {
    return {comments: comments.map(CommentUtils.asFlatData), nextCreationToken};
  },

  /**
   * @param {Comment} comment
   * @return {FlatCommentData}
   */
  asFlatData(comment) {
    const flatData = comment.toJSON();
    delete flatData.createdAt;
    delete flatData.updatedAt;
    delete flatData.id;

    return flatData;
  }
};
