/**
 * sails.config.routes
 */
module.exports.routes = {
  '/': {
    view: 'index',
  },
  '/game': {
    view: 'game',
    policy: 'isWorldBuilder',
  },
  '/static/protected/*': 'ProtectedFilesController.download',
};
