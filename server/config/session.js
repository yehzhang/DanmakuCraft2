/**
 * sails.config.session
 */
module.exports.session = {
  secret: 'd662a776ad0b9d3909b0348d4e074d6asds1',

  cookie: {
    // Cookie expiration in milliseconds.
    // For example, use 24 * 60 * 60 * 1000 to make sessions expire in 24 hours.
    // Default is null, making it a browser cookie, so the session will
    // last only for as long as the browser is open.
    // maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // = 10 years.
    maxAge: 30 * 24 * 60 * 60 * 1000, // = 30 days.
    // Path that the cookie is valid for.
    path: '/',
    // Should the session cookie be HTTP-only? (See https://www.owasp.org/index.php/HttpOnly)
    httpOnly: true,
    // Should the session cookie be secure? (only valid for HTTPS sites)
    secure: false,
  },

  adapter: 'connect-redis',

  /**
   * If no options are set a redis instance running on localhost is expected.
   * Read more about options at: https://github.com/visionmedia/connect-redis
   */
  // host: 'localhost',
  // port: 6379,
  // ttl: <redis session TTL in seconds>,
  // db: 0,
  // prefix: 'sess:',
  logErrors: true,

  /***************************************************************************
   *                                                                          *
   * Uncomment the following lines to set up a MongoDB session store that can *
   * be shared across multiple Sails.js servers.                              *
   *                                                                          *
   * Requires connect-mongo (https://www.npmjs.com/package/connect-mongo)     *
   * Use version 0.8.2 with Node version <= 0.12                              *
   * Use the latest version with Node >= 4.0                                  *
   *                                                                          *
   ***************************************************************************/

  // adapter: 'mongo',
  // url: 'mongodb://user:password@localhost:27017/dbname', // user, password and port optional

  /***************************************************************************
   *                                                                          *
   * Optional Values:                                                         *
   *                                                                          *
   * See https://github.com/kcbanner/connect-mongo for more                   *
   * information about connect-mongo options.                                 *
   *                                                                          *
   * See http://bit.ly/mongooptions for more information about options        *
   * available in `mongoOptions`                                              *
   *                                                                          *
   ***************************************************************************/

  // collection: 'sessions',
  // stringify: true,
  // mongoOptions: {
  //   server: {
  //     ssl: true
  //   }
  // }

};
