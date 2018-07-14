// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from: 'production',
  testEnvironment: 'NODE_ENV',

  host:          process.env.PROD_APP_HOST  || 'api-app.feathersjs.com',
  port: parseInt(process.env.PROD_APP_PORT) || 8080,
  public:        process.env.PROD_PUBLIC    || '../public/',
  email_service: process.env.PROD_EMAIL_SERVICE,
  email_login:   process.env.PROD_EMAIL_LOGIN,
  email_pass:    process.env.PROD_EMAIL_PASSWORD,
  email_reports: process.env.PROD_EMAIL_REPORTS,

};

