const shortid = require('shortid');

module.exports = {
  attributes: {
    shortId: {
      type: 'string',
      index: true,
      defaultsTo: shortid.generate,
    },
  },
};
