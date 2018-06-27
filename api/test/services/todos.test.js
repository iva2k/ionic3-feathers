const assert = require('assert');
const app = require('../../server/app');

describe('\'todos\' service', function() {
  it('registered the service', function() {
    const service = app.service('todos');

    assert.ok(service, 'Registered the service');
  });
});
