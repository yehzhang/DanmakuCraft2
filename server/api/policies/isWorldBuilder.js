module.exports = function (req, res, next) {
  const allowedIps = ['::1', '127.0.0.1'];

  let ip = req.ip;
  if (ip.startsWith('::ffff:')) {
    ip = ip.substr('::ffff:'.length);
  }

  if (ip.startsWith('192.168.') || allowedIps.includes(ip)) {
    return next();
  }

  return res.forbidden();
};
