// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from: 'test',

  nedb: '../test/data',
  email_service: process.env.TEST_EMAIL_SERVICE,
  email_login:   process.env.TEST_EMAIL_LOGIN,
  email_pass:    process.env.TEST_EMAIL_PASSWORD,
  email_reports: process.env.TEST_EMAIL_REPORTS,

};

