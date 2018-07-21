// @feathersjs/configuration pulls in default and <env> settings files using Node's `require()`.
// Node require() looks first for <filename>.js, and if not found, it will check for <filename>.json
// This configuration file has `.js` suffix, and must provide a `module.exports` containing the configuration properties.

module.exports = {
  from: 'default',
  protocol         : 'https',
  host             : 'localhost',
  port             : 3030,
  public           : '../public/',
  logo             : process.env.LOGO              || 'logo.png', // File in public folder

  paginate : {
    default: 10,
    max: 50
  },
  nedb             : '../data',
  email_service    : '',
  email_login      : '',
  email_pass       : '',
  email_reports    : '',
  email_support    : '',
  email_from_auth  : '',
  gravatar_only    : true,
  gravatar_ext     : 'jpg',
  gravatar_size    : 60,
  gravatar_default : 'robohash',
  gravatar_rating  : 'g',

  authentication: {
    secret: '0e12c47d13d3140b3332c844e146c5fda409ec162b27dbf97228556d19ade0b5a7824dc008e604509a476b7db7fffead50248c1b57a34e492935091876219ea54ccebc7c5d65d2b1baa3771993d61d6cfde35e100cffcd59b7ccc787eff087f9a61e2d855b70cc1e73d27c6f123ac05194d6f3bc44ac1cc8f0b9c7db1c700f5bbc34b0cf7d4c67b5b8669684fc27331b4c79cc40263538c73c13710eb65ac157bfab05d3f9f3ce94b3aecb79fd3449048b9087eb9859d8cf60d96d48878f719bb87db70a8e8dc25b11a9c747c8364d155d610ecf977196039d65923f1b34c3ead6b692d0eb7918941adb9034439d3394eb4b0d16ea76e9605a44d50001df0a9f',
    strategies: [
      'jwt',
      'local'
    ],
    path: '/authentication',
    service: 'users',
    jwt: {
      header: {
        typ: 'access'
      },
      audience: 'https://yourdomain.com',
      subject: 'anonymous',
      issuer: 'feathers',
      algorithm: 'HS256',
      expiresIn: '1d'
    },
    local: {
      entity: 'user',
      usernameField: 'email',
      passwordField: 'password'
    },
    google: {
      clientID: 'your google client id',
      clientSecret: 'your google client secret',
      successRedirect: '/',
      scope: [
        'profile openid email'
      ]
    },
    facebook: {
      clientID: 'your facebook client id',
      clientSecret: 'your facebook client secret',
      successRedirect: '/',
      scope: [
        'public_profile',
        'email'
      ],
      'profileFields': [
        'id',
        'displayName',
        'first_name',
        'last_name',
        'email',
        'gender',
        'profileUrl',
        'birthday',
        'picture',
        'permissions'
      ]
    },
    cookie: {
      enabled: true,
      name: 'feathers-jwt',
      httpOnly: false,
      secure: false
    }
  }
};

