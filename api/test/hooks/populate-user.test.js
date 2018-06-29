const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const populateUser = require('../../server/hooks/populate-user');

describe('\'populate-user\' hook', function() {
  let app, user;

  beforeEach(async function() {
    // Database adapter pagination options
    const options = {
      id: '_id', // Enforce _id usage for consistency, must be used for all services, so they are interchangeable.
      paginate: {
        default: 10,
        max: 25
      }
    };

    app = feathers();

    // Register `users` and `todos` service in-memory
    app.use('/users', memory(options));
    app.use('/todos', memory(options));

    // Add the hook to the service
    app.service('todos').hooks({
      after: populateUser()
    });

    // Create a new user we can use to test with
    user = await app.service('users').create({
      email: 'test@user.com'
    });
  });

  it('populates a new todo with the user', async function() {
    const todo = await app.service('todos').create({
      title: 'A test todo',
      // Set `userId` manually (usually done by `process-todo` hook)
      userId: user._id
    });

    // Make sure that user got added to the returned todo
    assert.deepEqual(todo.user, user);
  });
});
