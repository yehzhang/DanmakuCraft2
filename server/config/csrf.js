/**
 * Cross-Site Request Forgery Protection Settings (sails.config.csrf)
 *
 * When enabled, all non-GET requests to the Sails server must be accompanied by
 * a special token, identified as the '_csrf' parameter.
 *
 * This token has a short-lived expiration timeline, and must be acquired by either:
 *
 * (a)		For traditional view-driven web apps:
 *			Fetching it from one of your views, where it may be accessed as
 *			a local variable, e.g.:
 *			<form>
 *				<input type="hidden" name="_csrf" value="<%= _csrf %>" />
 *			</form>
 *
 * or (b)	For AJAX/Socket-heavy and/or single-page apps:
 *			Sending a GET request to the `/csrfToken` route, where it will be returned
 *			as JSON, e.g.:
 *			{ _csrf: 'ajg4JD(JGdajhLJALHDa' }
 *
 *
 * Enabling this option requires managing the token in your front-end app.
 * For traditional web apps, it's as easy as passing the data from a view into a form action.
 * In AJAX/Socket-heavy apps, just send a GET request to the /csrfToken route to get a valid token.
 */

// No need to enable for creation of comment as it is already protected by sendNextCommentToken.
module.exports.csrf = false;

// module.exports.csrf = {
//   csrf: true,
//   grantTokenViaAjax: true,
// };
