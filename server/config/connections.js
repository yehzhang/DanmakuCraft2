/**
 * Connections (sails.config.connections)
 *
 * Put your passwords/api keys in `config/local.js`, environment variables, etc.
 *
 * An adapter (e.g. `sails-mysql`) is generic -- it needs some additional information to work (e.g.
 * your database host, password, user, etc.) A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections. If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.
 */

module.exports.connections = {

  /***************************************************************************
  *                                                                          *
  * Local disk storage for DEVELOPMENT ONLY                                  *
  *                                                                          *
  * Installed by default.                                                    *
  *                                                                          *
  ***************************************************************************/
  localDiskDb: {
    adapter: 'sails-disk'
  },

  /***************************************************************************
  *                                                                          *
  * Run: npm install sails-postgresql@for-sails-0.12 --save                  *
  *                                                                          *
  ***************************************************************************/
  localDevPostgresqlServer: {
    adapter: 'sails-postgresql',
    host: 'localhost',
    port: 5432,
    database: 'danmakucraft_2_dev',
  },

  localPostgresqlServer: {
    adapter: 'sails-postgresql',
    host: 'localhost',
    port: 5432,
    database: 'danmakucraft_2',
  },
};
