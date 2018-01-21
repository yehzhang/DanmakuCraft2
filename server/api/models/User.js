const shortid = require('shortid');

module.exports = {
  attributes: {
    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: shortid.generate,
    },
  },
};
