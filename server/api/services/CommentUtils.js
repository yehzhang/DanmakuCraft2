module.exports = {
  /**
   * @param {Comment} comment
   * @return {CommentCreatedData}
   */
  wrapAsCommentCreatedData(comment) {
    return { comment: CommentUtils.asFlatData(comment) };
  },

  /**
   * @param {Comment[]} comments
   * @return {CommentFoundData}
   */
  wrapAsCommentFoundData(comments) {
    return { comments: comments.map(CommentUtils.asFlatData) };
  },

  /**
   * @param {Comment} comment
   * @return {FlatCommentDataResponse}
   */
  asFlatData(comment) {
    const flatData = comment.toJSON();
    delete flatData.updatedAt;
    delete flatData.id;

    return flatData;
  },
};
