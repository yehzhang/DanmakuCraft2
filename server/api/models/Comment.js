module.exports = {
  attributes: {
    text: {
      type: 'string'
    },
    color: {
      type: 'integer'
    },
    size: {
      type: 'integer'
    },
    createdAt: {
      type: 'datetime',
      index: true,
      defaultsTo: () => new Date(),
    },
    coordinateX: {
      type: 'integer',
    },
    coordinateY: {
      type: 'integer',
    },
    buffType: {
      type: 'integer',
      required: false,
    },
    buffParameter: {
      type: 'integer',
      required: false,
    },
    user: {
      model: 'user',
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
