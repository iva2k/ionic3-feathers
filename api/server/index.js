/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');

function run() {
  const port = app.get('port');
  const server = app.listen(port);

  process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
  );

  server.on('listening', () =>
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
  );

}

logger.info('NODE_ENV: %s', process.env.NODE_ENV);
logger.info('app.get(\'env\'): %s', app.get('env'));
logger.info('from: %s', app.get('from'));
logger.info('host: %s', app.get('host'));
logger.info('port: %s', app.get('port'));

async function seedDB(args = {dropDB: true, usersCount: 3, todosPerUserCount: 3, createAdmins: true}) {
  // Data seeder. see https://github.com/thosakwe/feathers-seeder
  // Also see possible data patterns: https://github.com/marak/Faker.js
  const seeder = require('feathers-seeder');
  const TODOS = {
    delete: false,
    path: 'todos',
    count: args.todosPerUserCount || 3,
    template: { title: '{{commerce.productName}}', notes: 'Perform {{company.catchPhrase}}, then {{hacker.verb}}.' },
  };
  const TODOS_IT = {
    delete: false,
    path: 'todos',
    count: args.todosPerUserCount || 3,
    template: { title: 'Improve {{commerce.productAdjective}} {{commerce.product}}', notes: 'Provision {{name.jobTitle}}, then {{company.bsNoun}}.' },
  };
  const ADMINS = [
    {
      path: 'users',
      count: 1,
      template: {
        email: 'iva2k@yahoo.com',
        //username: 'iva2k',
        //name: 'iva2k',
        password: '1234',
        //TODO: lastLogin: () => moment().subtract(7, 'days').format()
      },
      callback(user, seed) {
        // Create todos for each user
        const templ = TODOS_IT;
        templ.template.userId = user._id;
        templ.params = { userId: user._id }; // Note that hooks must be setup to pass given userId if no user is authenticated.
        return seed(templ);
      }
    },
  ];
  const USERS = [
    {
      path: 'users',
      count: args.usersCount || 3,
      template: {
        email: '{{internet.email}}',
        //username: '{{internet.userName}}',
        //name: '{{name.firstName}} {{name.lastName}}',
        password: '{{internet.password}}',
        //TODO: lastLogin: () => moment().subtract(7, 'days').format()
      },
      callback(user, seed) {
        // Create todos for each user
        const templ = TODOS;
        templ.template.userId = user._id;
        templ.params = { userId: user._id }; // Note that hooks must be setup to pass given userId if no user is authenticated.
        return seed(templ);
      }
    },
  ];

  let services = [];
  if (args.createAdmins) {
    services = services.concat(ADMINS);
  }
  services = services.concat(USERS);

  // Perform DB operations
  if (args.dropDB) {
    logger.info('Erasing the database...');
    await app.service('todos').remove(null, {}); // Remove all
    await app.service('users').remove(null, {}); // Remove all
  }
  logger.info('Seeding the database...');
  await app.configure(seeder({
    delete: false, // This only sets default for 'delete' in root seeder services, but not anything in the seeder callbacks.
    services
  })).seed();
  logger.info('Done seeding the database.');
}

if (app.get('env') === 'production' || app.get('env') === 'test') {
  // 'production', 'test' - No seeding
  run();
} else {
  // 'development', 'staging' - Seed DB
  seedDB().then( () =>
    run()
  ).catch( logger.error );
}
