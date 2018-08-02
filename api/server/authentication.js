const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
const oauth2 = require('@feathersjs/authentication-oauth2');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const custom = require('feathers-authentication-custom'); // wrapper for 'passport-custom'
const verifySocialToken = require('./utility/verifySocialToken');

class CustomVerifier {
  constructor(app, options) {
    this.app = app;
    this.options = options;
    this.service = app.get('authentication').service;
  }
  async verify(req, callback) { // performs custom verification

    // Custom user finding logic here, or set to false based on req object
    try {
      // this is what client sent to server
      const { network, email, socialId, socialToken } = req.body;

      // verify social id and token
      await verifySocialToken(network, socialId, socialToken);

      // find user
      let users = await this.app.service(this.service).find({
        query: {
          email
        }
      });
      let user = null;
      if (!users.total) {
        // user does not exist yet, create new user
        user = await this.app.service(this.service).create({
          email,
          createdFrom: network // Save what network user registered with.
        });
      } else {
        user = users.data[0];
      }

      callback(null, user); // success
    } catch (err) {
      callback(err, false);
    }

  }
}

module.exports = function (app) {
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local());

  app.configure(oauth2(Object.assign({
    name: 'google',
    Strategy: GoogleStrategy
  }, config.google)));

  app.configure(oauth2(Object.assign({
    name: 'facebook',
    Strategy: FacebookStrategy
  }, config.facebook)));

  // custom passport strategy for client side social login
  app.configure(custom(Object.assign({
    name: 'social_token',
    //?Strategy: SocialTokenStrategy,
    Verifier: CustomVerifier
  }, config.social_token)));

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies),
        // This hook adds userId attribute to the JWT payload // TODO: (soon) Move to a proper hook file.
        (hook) => {
          if (!(hook.params.authenticated))
            return;

          const user = hook.params.user;
          // make sure params.payload exists
          hook.params.payload = hook.params.payload || {};
          // merge in a `userId` property
          Object.assign(hook.params.payload, { userId: user._id });
        }
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
