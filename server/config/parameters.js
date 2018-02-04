const shortid = require('shortid');

module.exports.parameters = {
  bundleFileUrl: '/static/prod/bundle.js',
  betaBundleFileUrl: '/static/dev/bundle.js',

  nextCommentCreation: {
    interval: 2,
    tokenExpiresIn: "1 day",
  },

  serverInstanceId: shortid.generate(),
};
