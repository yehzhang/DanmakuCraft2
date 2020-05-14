const http = require('http');

/**
 * hook specification
 *
 * @help http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification
 */
module.exports = function redirectToHttps(sails) {
  return {
    /**
     * The defaults feature can be implemented either as an object or a function which
     * takes a single argument and returns an object.
     * The object you specify will be used to provide default configuration values for Sails.
     *
     * @help http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification/defaults
     */
    defaults: {
      redirectToHttps: {
        // disable HTTPS redirect
        disabled: false,

        // listen for all connected hostname
        hostname: '0.0.0.0',

        // port to listen
        port: undefined,
      },
    },

    /**
     * The initialize feature allows a hook to perform startup tasks
     * that may be asynchronous or rely on other hooks.
     * All Sails configuration is guaranteed to be completed
     * before a hook’s initialize function runs.
     *
     * @help http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification/initialize
     */
    initialize(cb) {
      try {
        startServer(sails, cb);
      } catch (error) {
        cb(error);
      }
    },
  };
};

function startServer(sails, cb) {
  // handle undefined port
  if (typeof sails.config.redirectToHttps.port !== 'number') {
    sails.config.redirectToHttps.port = 80;
  }

  // ensure configured HTTPS server (and enabled hook)
  if (!sails.config.ssl.key || !sails.config.ssl.cert || sails.config.redirectToHttps.disabled) {
    // do not start any server
    return cb();
  }

  // handle same port configured for HTTP and HTTPS servers
  if (sails.config.redirectToHttps.port === sails.config.port) {
    // stop server lift
    return cb(new TypeError('HTTP and HTTPS server have the same port configured'));
  }

  const server = http.createServer(function (req, res) {
    try {
      redirectToHttps(req, res);
    } catch (error) {
      res.writeHead(500);
      res.end();
    }
  });

  // start listening
  server.listen(
    sails.config.redirectToHttps.port,
    sails.config.redirectToHttps.hostname,
    (error) => {
      if (error) {
        return cb(error);
      }
      sails.once('lower', () => {
        server.close();
      });
      cb();
    }
  );
}

function redirectToHttps(req, res) {
  let port;
  if (sails.config.port === 443) {
    port = '';
  } else {
    port = ':' + sails.config.port;
  }

  let path = req.url;
  if (typeof path === 'string') {
    // TODO is this check necessary?
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
  } else {
    path = '';
  }

  const location = `https://${sails.config.hostname}${port}${path}`;

  res.writeHead(301, { Location: location });
  res.end();
}
