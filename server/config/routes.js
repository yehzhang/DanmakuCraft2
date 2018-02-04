/**
 * Route Mappings (sails.config.routes)
 */
module.exports.routes = {
  '/': {
    view: 'game',
  },
  '/beta': {
    view: 'game-beta',
    policy: 'isWorldBuilder',
  },
};
