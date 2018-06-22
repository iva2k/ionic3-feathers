

const processTodo = require('../../hooks/process-todo');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [processTodo()],
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
