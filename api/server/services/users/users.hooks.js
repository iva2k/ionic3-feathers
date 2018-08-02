const { authenticate } = require('@feathersjs/authentication').hooks;

const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;

const gravatar = require('../../hooks/gravatar');

// How to add email verification
// From https://blog.feathersjs.com/how-to-setup-email-verification-in-feathersjs-72ce9882e744

//TODO: const verifyHooks = require('feathers-authentication-management').hooks;
const commonHooks = require('feathers-hooks-common');

// TODO: const globalHooks = require ...
/*
import accountService from '../services/authManagement/notifier'
exports.sendVerificationEmail = options => hook => {
  if (!hook.params.provider) { return hook; }
  const user = hook.result
  if(process.env.GMAIL && hook.data && hook.data.email && user) {
    accountService(hook.app).notifier('resendVerifySignup', user)
    return hook
  }
  return hook
}
*/

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [
      //TODO: verifyHooks.addVerification(), // email verification
      //TODO: customizeOauthProfile(),
      hashPassword(),
      gravatar()
    ],
    update: [
      commonHooks.disallow('external') // disallow any external modifications
      //TODO: customizeOauthProfile(),
      // removed: hashPassword(), authenticate('jwt')
    ],
    patch: [
      commonHooks.iff(
        // feathers-authentication-management does its own hash, add only for external,
        // see https://github.com/feathers-plus/feathers-authentication-management/issues/96
        // https://hackernoon.com/setting-up-email-verification-in-feathersjs-ce764907e4f2
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(
          true, // to throw if fields are modified (use false to delete changed fields)
          'email',
          'isVerified',
          'verifyToken',
          'verifyShortToken',
          'verifyExpires',
          'verifyChanges',
          'resetToken',
          'resetShortToken',
          'resetExpires'
        ),
        [
          hashPassword(),
          authenticate('jwt')
        ]
      )
    ],
    remove: [ authenticate('jwt') ]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [

      // TODO: globalHooks.sendVerificationEmail(),
      //// removes verification/reset fields other than .isVerified
      // verifyHooks.removeVerification(),

    ],
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
