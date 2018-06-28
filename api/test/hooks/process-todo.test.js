const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const appHooks = require('../../server/app.hooks');
const hooks = require('../../server/services/todos/todos.hooks');
//const processTodo = require('../../server/hooks/process-todo');

describe('\'process-todo\' hook', function() {
  let app;
  const user = { _id: 'test' }; // A user stub with just an `_id`
  const params = { user }; // Provide the user for service method calls

  beforeEach(function() {
    app = feathers();

    // Register a dummy custom service that just return the message data back
    app.use('/todos', {
      async create(data) {
        return data;
      }
    });

    app.hooks(appHooks);
    app.service('todos').hooks(hooks);
    //app.service('todos').hooks({
    //  before: processTodo()
    //});
  });

  it('processes the todo as expected', function () {
    // Create a new message
    return app.service('todos').create({
      title: 'Test task',
      additional: 'should be removed',
      notes: 'should be passed'
    }, params)
      .then(todo => {
        assert.equal(todo.title, 'Test task');
        //TODO:    assert.equal(todo.userId, 'test'); // `userId` was set
        assert.ok(!todo.additional); // `additional` property has been removed
        assert.equal(todo.notes, 'should be passed');
      });
  });

  it('rejects the todo without title as expected', function() {
    // Try to create a new message without title
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
    // Create a new message without notes
    return app.service('todos').create({
      title: 'Test task 2',
      additional: 'should be removed'
      // no notes
    }, params)
      .then(todo => {
        assert.equal(todo.title, 'Test task 2');
        //TODO:    assert.equal(todo.userId, 'test'); // `userId` was set
        assert.ok(!todo.additional); // `additional` property has been removed
        assert.equal(todo.notes, ''); // empty `notes` property has been created
      });
  });

});
