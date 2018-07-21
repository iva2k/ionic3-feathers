const assert = require('assert');
const app = require('../../server/app');

describe('\'emails\' service', function() {
  it('registered the service', function(done) {
    const service = app.service('emails');

    assert.ok(service, 'Registered the service');
    done();
  });
});
