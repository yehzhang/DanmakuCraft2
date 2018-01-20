module.exports = {
  _config: {
    autoPK: false,
  },

  attributes: {
    id: {
      type: 'string',
      primaryKey: true,
    },
    user: {
      model: 'user',
    },
  },

  getOrCreate() {

  }
};
