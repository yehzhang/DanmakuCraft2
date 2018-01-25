module.exports = {
  attributes: {
    text: {
      type: 'string',
      required: true,
    },
    color: {
      type: 'integer',
      required: true,
    },
    size: {
      type: 'integer',
      required: true,
    },
    createdAt: {
      type: 'datetime',
      index: true,
      defaultsTo: () => new Date(),
    },
    coordinateX: {
      type: 'integer',
      required: true,
    },
    coordinateY: {
      type: 'integer',
      required: true,
    },
    buffType: {
      type: 'integer',
    },
    buffParameter: {
      type: 'integer',
    },
    user: {
      model: 'user',
      required: true,
    },

    /**
     * @return {FlatCommentData}
     */
    toJSON() {
      let data = this.toObject();

      if (data.buffType == null) {
        delete data.buffType;
        delete data.buffParameter;
      }

      return data;
    },
  },

  /**
   * @param {int} count
   * @return {Promise<FlatCommentData[]>}
   */
  async findLatestData(count) {
    return await Comment.find({
      select: ['text', 'color', 'size', 'coordinateX', 'coordinateY', 'buffType', 'buffParameter'],
      limit: count,
      sort: 'createdAt DESC',
    });
  },

  /**
   * @param {object} data
   * @return {Promise<FlatCommentData>}
   */
  async createAsFlatData(data) {
    let comment = await Comment.create(data);

    let flatData = comment.toJSON();
    delete flatData.createdAt;
    delete flatData.updatedAt;
    delete flatData.user;
    delete flatData.id;

    return flatData;
  },
};
