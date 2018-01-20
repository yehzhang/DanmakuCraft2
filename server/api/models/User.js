module.exports = {
  _config: {
    autoPK: false,
  },

  attributes: {
    id: {
      type: 'string',
      primaryKey: true,
    },
    isAutomaticallyCreated: {
      type: 'boolean',
    },
  }
};
