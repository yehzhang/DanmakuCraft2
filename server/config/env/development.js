/**
 * This file will be committed to the repository. Don't add any private information to this file!
 */
const {readFileSync} = require('fs');
const {resolve} = require('path');

module.exports = {
  blueprints: {
    shortcuts: true,
  },
  models: {
    migrate: 'drop'
  },
  port: 443,
  ssl: {
    cert: readFileSync(resolve('../data/ssl/localhost/localhost.cert')),
    key: readFileSync(resolve('../data/ssl/localhost/localhost.key')),
  },
};
