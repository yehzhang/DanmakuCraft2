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
  },

  async findLatest(count) {
    return await Comment.find({
      limit: count,
      sort: 'sendTime DESC',
    });
  }
};
