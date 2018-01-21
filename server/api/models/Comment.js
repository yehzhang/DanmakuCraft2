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

    toJSON() {
      let commentData = this.toObject();

      if (commentData.buffType == null) {
        delete commentData.buffType;
        delete commentData.buffParameter;
      }

      return commentData;
    },
  },

  async findLatestData(count) {
    return Comment.find({
      select: ['text', 'color', 'size', 'coordinateX', 'coordinateY', 'buffType', 'buffParameter'],
      limit: count,
      sort: 'createdAt DESC',
    });
  }
};
