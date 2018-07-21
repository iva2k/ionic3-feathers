const assert = require('assert');
const app = require('../../server/app');

describe('\'authManagement\' service', function () {
  it('registered the service', function (done) {
    const service = app.service('authManagement');

    assert.ok(service, 'Registered the service');
    done();
  });
});
