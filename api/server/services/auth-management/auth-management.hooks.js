//TODO: (when needed) const isEnabled = require('../../hooks/is-enabled');
const auth = require('@feathersjs/authentication').hooks;
const commonHooks = require('feathers-hooks-common');

const isAction = () => {
  let args = Array.from(arguments);
  return hook => args.includes(hook.data.action);
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      commonHooks.iff(
        isAction('passwordChange', 'identityChange'),
        [
          // TODO: (when needed) per https://blog.feathersjs.com/how-to-setup-email-verification-in-feathersjs-72ce9882e744
          //? auth.verifyToken(),
          //? auth.populateUser(),
          //? auth.restrictToAuthenticated()

          auth.authenticate('jwt'),
          //TODO: (when needed) implement: isEnabled()
        ]
      ),
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
