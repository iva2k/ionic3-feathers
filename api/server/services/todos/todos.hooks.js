

const { authenticate } = require('@feathersjs/authentication').hooks;

const processTodo = require('../../hooks/process-todo');
const populateUser = require('../../hooks/populate-user');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [ processTodo() ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ populateUser() ],
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
