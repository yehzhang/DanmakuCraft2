/**
 * Policy Mappings (sails.config.policies)
 *
 * Policies run **before** controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 */
module.exports.policies = {
  '*': false,

  CommentController: {
    '*': false,
    create: 'isLoggedIn',
    find: 'isLoggedIn',
  },

  // RabbitController: {
  //   // Apply the `false` policy as the default for all actions, preventing all accesses.
  //   '*': false,
  //   nurture: 'isRabbitMother',
  //   feed: ['isNiceToAnimals', 'hasRabbitFood'],
  // },
};
