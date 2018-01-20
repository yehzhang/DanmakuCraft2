/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 * return res.badRequest(data, 'some/specific/badRequest/view');
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */
module.exports = function badRequest(data, options) {
  let req = this.req;
  let res = this.res;
  let sails = req._sails;

  res.status(400);

  if (data === undefined) {
    sails.log.warn('Sending 400 ("Bad Request") response');
  } else {
    sails.log.warn('Sending 400 ("Bad Request") response: \n', data);
  }

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
    data = undefined;
  }

  // If the user-agent wants JSON, always respond with JSON
  // If views are disabled, revert to json
  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx(JsonResponse.wrapErrorData(data));
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? {view: options} : options || {};

  // Attempt to prettify responseData for views, if it's a non-error object
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
    return res.view(options.view, {data: viewData, title: 'Bad Request'});
  }
  return res.guessView({data: viewData, title: 'Bad Request'}, () => {
    res.jsonx(JsonResponse.wrapErrorData(data));
  });
};
