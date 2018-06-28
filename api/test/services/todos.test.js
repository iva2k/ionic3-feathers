const assert = require('assert');
const app = require('../../server/app');

describe('\'todos\' service', function() {
  it('registered the service', function(done) {
    const service = app.service('todos');

    assert.ok(service, 'Registered the service');
    done();
  });

  it('creates and processes todo, adds user information', async function() {
    // Create a new user we can use for testing
    //TODO: const user = await app.service('users').create({
    //  email: 'messagetest@example.com',
    //  password: 'supersecret'
    //});
    const user = { _id: 'test' }; // A user stub with just an `_id`

    // The messages service call params (with the user we just created)
    const params = { user };
    const todo = await app.service('todos').create({
      title: 'a test',
      additional: 'should be removed'
    }, params);

    assert.equal(todo.title, 'a test');
    //TODO: assert.equal(todo.userId, user._id); // `userId` should be set to the passed user
    assert.ok(!todo.additional); // Additional property has been removed
    //TODO: assert.deepEqual(todo.user, user); // `user` has been populated
  });
});
