//const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
//const auth = require('feathers-authentication').hooks;


module.exports = {
  before: {
    all: [hooks.disable('external')], // disable any outside access to our transport.
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
