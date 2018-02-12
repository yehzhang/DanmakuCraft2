module.exports = function (req, res, next) {
  const allowedIps = [
    '::1',
    '127.0.0.1',
    ...sails.config.roles.getUserIps('builder'),
  ];

  let ip = req.ip;
  if (ip.startsWith('::ffff:')) {
    ip = ip.substr('::ffff:'.length);
  }

  if (allowedIps.includes(ip)) {
    return next();
  }

  return res.forbidden();
};
