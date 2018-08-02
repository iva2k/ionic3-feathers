// Initializes the `users` service on path `/users`
const createService = require('feathers-nedb');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const autocompaction = app.get('autocompaction');

  const options = {
    Model,
    paginate,
    id: '_id', // Enforce _id usage for consistency, must be used for all services, so they are interchangeable.
  };

  // Initialize our service with any options it requires
  app.use('/users', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  // NeDB-specific:
  let persistence = service.Model.persistence;
  if (persistence) {
    if (autocompaction) { if (persistence.setAutocompactionInterval) persistence.setAutocompactionInterval(autocompaction); }
    else                { if (persistence.compactDatafile          ) persistence.compactDatafile(); }
  }

  service.hooks(hooks);
};
