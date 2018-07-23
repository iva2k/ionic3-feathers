// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from             : 'test',
  protocol         :             process.env.TEST_APP_PROTOCOL   || 'https',
  host             :             process.env.TEST_APP_HOST       || 'localhost',
  port             :    parseInt(process.env.TEST_APP_PORT)      || 3030,
  //?public           :             process.env.TEST_PUBLIC         || '../public/',
  nedb             :             '../test/data',
  email_service    :             process.env.TEST_EMAIL_SERVICE,
  email_login      :             process.env.TEST_EMAIL_LOGIN,
  email_pass       :             process.env.TEST_EMAIL_PASSWORD,
  email_reports    :             process.env.TEST_EMAIL_REPORTS,
  email_support    :             process.env.TEST_EMAIL_SUPPORT,
  email_from_auth  :             process.env.TEST_EMAIL_FROM_AUTH,
  gravatar_only    : !!(parseInt(process.env.TEST_GRAVATAR_ONLY) || 1),
  gravatar_ext     :             process.env.TEST_GRAVATAR_EXT,
  gravatar_size    :    parseInt(process.env.TEST_GRAVATAR_SIZE),
  gravatar_default :             process.env.TEST_GRAVATAR_DEFAULT,
  gravatar_rating  :             process.env.TEST_GRAVATAR_RATING,
};

