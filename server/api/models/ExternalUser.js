module.exports = {
  attributes: {
    origin: {
      type: 'string',
      enum: ['bilibili'],
    },
    correspondsTo: {
      model: 'user',
    },
    externalId: {
      type: 'string',
      required: false,
    },
  }
};
