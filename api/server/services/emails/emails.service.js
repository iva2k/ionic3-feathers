// Initializes the `emails` service on path `/emails`
const hooks = require('./emails.hooks');

const mailer = require('feathers-mailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    service: app.get('email_service'),
    auth: {
      user: app.get('email_login'),
      pass: app.get('email_pass')
    }
  };

  // Initialize our service with any options it requires
  app.use('/emails', mailer( smtpTransport(options) ) );

  // Get our initialized service so that we can register hooks
  const service = app.service('emails');

  service.hooks(hooks);
};
