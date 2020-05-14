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

    /**
     * @return {FlatCommentDataResponse}
     */
    toJSON() {
      const data = this.toObject();

      if (data.buffType == null) {
        delete data.buffType;
        delete data.buffParameter;
      }

      data.createdAt = new Date(data.createdAt).getTime();

      return data;
    },
  },

  /**
   * @param {int} count
   * @return {Promise<FlatCommentDataResponse[]>}
   */
  async findLatestData(count) {
    return await Comment.find({
      select: [
        'text',
        'color',
        'size',
        'coordinateX',
        'coordinateY',
        'buffType',
        'buffParameter',
        'createdAt',
      ],
      limit: count,
      sort: 'createdAt DESC',
    });
  },
};
