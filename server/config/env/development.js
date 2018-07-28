/**
 * This file will be committed to the repository. Don't add any private information to this file!
 */
module.exports = {
  blueprints: {
    shortcuts: true,
  },

  models: {
    connection: 'localDevPostgresqlServer',
    migrate: 'drop',
  },

  port: 1337,

  log: {
    level: 'verbose',
    filePath: 'build/production.log',
  },
};
