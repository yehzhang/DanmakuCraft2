module.exports = {
  attributes: {
    origin: {
      type: 'string',
      enum: ['bilibili'],
      required: true,
    },
    correspondsTo: {
      model: 'user',
      required: true,
    },
    // For users of bilibili origin, this field contains their hashed UIDs.
    externalId: {
      type: 'string',
    },
  }
};
