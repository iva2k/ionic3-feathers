/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');

// Data seeder:
const seeder = require('feathers-seeder');
const TODOS = {
  path: 'todos',
  delete: true,
  count: 3,
  templates: [ {title: 'Task A', notes: 'Perform task A, then chill.'}, {title: 'Task B', notes: 'Perform task B, then nap.'}, {title: 'Task C', notes: '{{lorem.sentence}}'} ]
};
const services = [];
services.push(TODOS);
app.configure(seeder(
  {
    services
  }
//  app.get('seeder')
))
  .seed()
  .then(() => {

const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);

  })
;
