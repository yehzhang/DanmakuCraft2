const shortid = require('shortid');

module.exports = {
  nextCommentCreation: {
    interval: 2,
    tokenExpiresIn: "1 day",
  },

  serverInstanceId: shortid.generate(),

  hostname: 'danmakucraft.com',

  bundleFileUrl: '/static/prod/bundle.js',
};
