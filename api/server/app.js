const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');

// Load local / private config file into process.env using dotenv:
//?require('dotenv').config({path: path.resolve(process.cwd(), 'config/private.env')})
require('dotenv').config({path: path.resolve(__dirname, '../config/private.env')});

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');


const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');
const authManagement = require('feathers-authentication-management');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);

const options = {
  service: '/users', // default: '/users'
  path: 'authManagement', // The path to associate with this service. Default authManagement
  // notifier: function(type, user, notifierOptions) : Promise => {},
  //  type: type of notification:
  //    - 'resendVerifySignup' From resendVerifySignup API call
  //    - 'verifySignup' From verifySignupLong and verifySignupShort API calls
  //    - 'sendResetPwd' From sendResetPwd API call
  //    - 'resetPwd' From resetPwdLong and resetPwdShort API calls
  //    - 'passwordChange' From passwordChange API call
  //    - 'identityChange' From identityChange API call
  //  user: user's item, minus password.
  //  notifierOptions: notifierOptions option from resendVerifySignup and sendResetPwd API calls
  longTokenLen: 15, // Half the length of the long token. Default is 15, giving 30-char tokens.
  shortTokenLen: 6, // Length of short token. Default is 6.
  shortTokenDigits: true, // Short token is digits if true, else alphanumeric. Default is true.
  delay: 5 * 24 * 60 * 60 * 1000, // Duration for sign up email verification token in ms. Default is 5 days.
  resetDelay: 2 * 60 * 60 * 1000, // Duration for password reset token in ms. Default is 2 hours.
  identifyUserProps: ['email'], // Prop names in user item which uniquely identify the user,
  // e.g. ['username', 'email', 'cellphone']. The default is ['email']. The prop values must be strings.
  // Only these props may be changed with verification by the service. At least one of these props must
  // be provided whenever a short token is used, as the short token alone is too susceptible to brute
  // force attack.
};
app.configure( authManagement({ options }) );
// https://github.com/feathers-plus/feathers-authentication-management/blob/master/docs.md
// The authManagement service creates and maintains the following properties in the user item:
//   - isVerified: If the user's email addr has been verified (boolean)
//   - verifyToken: The 30-char token generated for email addr verification (string)
//   - verifyShortToken: The 6-digit token generated for cellphone addr verification (string)
//   - verifyExpires: When the email addr token expire (Date)
//   - verifyChanges New values to apply on verification to some identifyUserProps (string array)
//   - resetToken: The 30-char token generated for forgotten password reset (string)
//   - resetShortToken: The 6-digit token generated for forgotten password reset (string)
//   - resetExpires: When the forgotten password token expire (Date)
// The following user item might also contain the following props:
//   - preferredComm The preferred way to notify the user. One of identifyUserProps.


// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
