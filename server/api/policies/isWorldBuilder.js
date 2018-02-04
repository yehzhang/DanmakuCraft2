module.exports = function (req, res, next) {
  const allowedIps = [
    '::1',
    '127.0.0.1',
    ...sails.config.roles.getUserIps('builder'),
  ];
  if (allowedIps.includes(req.ip)) {
    return next();
  }

  return res.forbidden();
};
