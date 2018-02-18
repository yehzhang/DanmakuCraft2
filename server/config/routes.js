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
  '/beta': {
    view: 'game-beta',
    policy: 'isWorldBuilder',
  },
  '/static/dev/*': 'ProtectedFilesController.download',
};
