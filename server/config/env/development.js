/**
 * This file will be committed to the repository. Don't add any private information to this file!
 */
const {readFileSync} = require('fs');
const {resolve} = require('path');

let ssl;
try {
  ssl = {
    cert: readFileSync('/etc/letsencrypt/live/danmakucraft.com/fullchain.pem'),
    key: readFileSync('/etc/letsencrypt/live/danmakucraft.com/privkey.pem'),
  };
} catch (ignored) {
  console.error('Failed to load ssl certificates. Using fake certificates instead.');
  ssl = {
    cert: readFileSync(resolve('../data/ssl/localhost/localhost.cert')),
    key: readFileSync(resolve('../data/ssl/localhost/localhost.key')),
  };
}

module.exports = {
  blueprints: {
    shortcuts: true,
  },
  models: {
    connection: 'localDevPostgresqlServer',
    migrate: 'drop',
  },
  port: 443,
  ssl,
};
