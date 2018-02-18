const {resolve} = require('path');

module.exports = {
  async download(req, res) {
    return ControllerUtils.catchServerError(res, async () => {
      let assetPath = req.path;
      if (assetPath.startsWith('/')) {
        assetPath = assetPath.slice(1);
      }

      const filePath = resolve(sails.config.appPath, 'assets', assetPath);
      return res.sendfile(filePath);
    });
  },
};
