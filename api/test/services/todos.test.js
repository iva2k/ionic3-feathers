const assert = require('assert');
const app = require('../../server/app');

describe('\'todos\' service', function() {
  it('registered the service', function(done) {
    const service = app.service('todos');

    assert.ok(service, 'Registered the service');
    done();
  });

  it('creates and processes todo, adds user information', function() {
    // Create a new user we can use for testing
    //?Promise.resolve({ _id: 'test' }) // A user stub with just an `_id`
    app.service('users').create({
      email: 'todotest@example.com',
      password: 'supersecret'
    })
      .then(user => {

        // The todos service call params (with the user we just created)
        const params = { user };

        return app.service('todos').create({
          title: 'a test',
          additional: 'should be removed'
        }, params)
          .then(todo => {
            assert.equal(todo.title, 'a test');
            assert.equal(todo.userId, user._id); // `userId` should be set to the passed user
            assert.ok(!todo.additional); // Additional property has been removed
            assert.deepEqual(todo.user, user); // `user` has been populated
          });
      });
  });
});
