/**
 * This file will be committed to the repository. Don't add any private information to this file!
 */
module.exports = {
  blueprints: {
    shortcuts: true,
  },

  models: {
    // see `sails.config.connections`
    connection: 'localDiskDb',
    // connection: 'localDevPostgresqlServer',
  },

  port: 1337,

  log: {
    level: 'verbose',
    filePath: 'build/production.log',
  },
};
