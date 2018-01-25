module.exports = {
  /**
   * @param {FlatCommentData} flatData
   * @param {string} nextCreationToken
   * @return {CommentCreatedData}
   */
  wrapAsCommentCreatedData(flatData, nextCreationToken) {
    return {comment: flatData, nextCreationToken};
  },

  /**
   * @param {FlatCommentData[]} flatDataList
   * @param {string} nextCreationToken
   * @return {CommentFoundData}
   */
  wrapAsCommentFoundData(flatDataList, nextCreationToken) {
    return {comments: flatDataList, nextCreationToken};
  },
};
