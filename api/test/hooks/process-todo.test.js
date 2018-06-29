const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
//const processTodo = require('../../server/hooks/process-todo');
const appHooks = require('../../server/app.hooks');
const hooks = require('../../server/services/todos/todos.hooks');

describe('\'process-todo\' hook', function() {
  let app;
  let user;
  let params;

  beforeEach(async function() {
    // Database adapter options
    const options = {
      id: '_id', // Enforce _id usage for consistency, must be used for all services, so they are interchangeable.
      paginate: {
        default: 10,
        max: 25
      }
    };

    app = feathers();

    // Register `users` service in-memory
    app.use('/users', memory(options));

    // Register a dummy custom service that just return the todo data back
    app.use('/todos', {
      async create(data) {
        return data;
      }
    });

    //// Register the `processTodo` hook on that service - bad, can hide broken inter-dependencies.
    //app.service('todos').hooks({
    //  before: {
    //    create: processTodo()
    //  }
    //});

    // Load all appHooks, to increase test coverage (e.g. for log.js)
    app.hooks(appHooks);

    // Load actual hooks file to increase test coverage - good, verifies actual inter-dependencies.
    app.service('todos').hooks(hooks);

    user = await app.service('users').create({ email: 'test@example.com' });
    params = { user: user }; // Provide the user for service method calls

  });

  it('processes the todo as expected', function() {
    // Create a new todo
    return app.service('todos').create({
      title: 'Test task',
      additional: 'should be removed',
      notes: 'should be passed'
    }, params)
      .then(todo => {
        assert.equal(todo.title, 'Test task');
        assert.equal(todo.userId, user._id); // `userId` was set
        assert.ok(!todo.additional); // `additional` property has been removed
        assert.equal(todo.notes, 'should be passed');
      });
  });

  it('rejects the todo without title as expected', function() {
    // Try to create a new todo without title
    return app.service('todos').create({
      // no title
      notes: 'does not matter'
    }, params)
      .catch(err => {
        // Test for specific error
        assert.equal(err, 'Error: A todo must have a title' );
      });
  });

  it('processes the todo without notes as expected', function() {
    // Create a new todo without notes
    return app.service('todos').create({
      title: 'Test task 2',
      additional: 'should be removed'
      // no notes
    }, params)
      .then(todo => {
        assert.equal(todo.title, 'Test task 2');
        assert.equal(todo.userId, user._id); // `userId` was set
        assert.ok(!todo.additional); // `additional` property has been removed
        assert.equal(todo.notes, ''); // empty `notes` property has been created
      });
  });

});
