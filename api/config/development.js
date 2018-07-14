// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from: 'development',

  host:          process.env.DEV_APP_HOST  || 'localhost',
  port: parseInt(process.env.DEV_APP_PORT) || 3030,
  public:        process.env.DEV_PUBLIC    || '../public/',
  nedb: '../data'
};

