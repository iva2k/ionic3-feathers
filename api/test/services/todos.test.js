const assert = require('assert');
const app = require('../../server/app');

describe('\'todos\' service', () => {
  it('registered the service', () => {
    const service = app.service('todos');

    assert.ok(service, 'Registered the service');
  });
});
