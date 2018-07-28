/**
 * This file will be committed to the repository. Don't add any private information to this file!
 */
const {readFileSync} = require('fs');

module.exports = {
  port: 443,
  ssl: {
    cert: readFileSync('/etc/letsencrypt/live/danmakucraft.com/fullchain.pem'),
    key: readFileSync('/etc/letsencrypt/live/danmakucraft.com/privkey.pem'),
  },

  models: {
    // see `sails.config.connections`
    connection: 'localPostgresqlServer',
  },
};
