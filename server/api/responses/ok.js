/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */
module.exports = function sendOK(data, options) {
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  sails.log.silly('res.ok() :: Sending 200 ("OK") response');

  res.status(200);

  // If appropriate, serve data as JSON(P)
  // If views are disabled, revert to json
  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx(JsonResponse.wrapValueData(data));
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? {view: options} : options || {};

  // Attempt to prettify data for views, if it's a non-error object
  let viewData = data;
  if (!(viewData instanceof Error) && 'object' == typeof viewData) {
    try {
      viewData = require('util').inspect(data, {depth: null});
    } catch (e) {
      viewData = undefined;
    }
  }

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, {data: viewData, title: 'OK'});
  }
  return res.guessView({data: viewData, title: 'OK'}, function couldNotGuessView() {
    return res.jsonx(JsonResponse.wrapValueData(data));
  });
};
