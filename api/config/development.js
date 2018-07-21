// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from             : 'development',
  protocol         :             process.env.DEV_APP_PROTOCOL   || 'https',
  host             :             process.env.DEV_APP_HOST       || 'localhost',
  port             :    parseInt(process.env.DEV_APP_PORT)      || 3030,
  public           :             process.env.DEV_PUBLIC         || '../public/',
  nedb             :                                               '../data',
  email_service    :             process.env.DEV_EMAIL_SERVICE,
  email_login      :             process.env.DEV_EMAIL_LOGIN,
  email_pass       :             process.env.DEV_EMAIL_PASSWORD,
  email_reports    :             process.env.DEV_EMAIL_REPORTS,
  email_support    :             process.env.DEV_EMAIL_SUPPORT,
  email_from_auth  :             process.env.DEV_EMAIL_FROM_AUTH,
  gravatar_only    : !!(parseInt(process.env.DEV_GRAVATAR_ONLY) || 1),
  gravatar_ext     :             process.env.DEV_GRAVATAR_EXT,
  gravatar_size    :    parseInt(process.env.DEV_GRAVATAR_SIZE) || 80,
  gravatar_default :             process.env.DEV_GRAVATAR_DEFAULT,
  gravatar_rating  :             process.env.DEV_GRAVATAR_RATING,
};

