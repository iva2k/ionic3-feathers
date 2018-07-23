// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from             : 'production',
  protocol         :             process.env.PROD_APP_PROTOCOL   || 'https',
  host             :             process.env.PROD_APP_HOST       || 'api-app.feathersjs.com',
  port             :    parseInt(process.env.PROD_APP_PORT)      || 8080,
  public           :             process.env.PROD_PUBLIC         || '../public/',
  //?nedb             :                                               '../data',
  email_service    :             process.env.PROD_EMAIL_SERVICE,
  email_login      :             process.env.PROD_EMAIL_LOGIN,
  email_pass       :             process.env.PROD_EMAIL_PASSWORD,
  email_reports    :             process.env.PROD_EMAIL_REPORTS,
  email_support    :             process.env.PROD_EMAIL_SUPPORT,
  email_from_auth  :             process.env.PROD_EMAIL_FROM_AUTH,
  gravatar_only    : !!(parseInt(process.env.PROD_GRAVATAR_ONLY) || 1),
  gravatar_ext     :             process.env.PROD_GRAVATAR_EXT,
  gravatar_size    :    parseInt(process.env.PROD_GRAVATAR_SIZE) || 80,
  gravatar_default :             process.env.PROD_GRAVATAR_DEFAULT,
  gravatar_rating  :             process.env.PROD_GRAVATAR_RATING,
};

