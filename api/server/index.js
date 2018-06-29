/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');

function run() {
  const server = app.listen(port);

  process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
  );

  server.on('listening', () =>
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
  );

}

logger.info('NODE_ENV = %s', process.env.NODE_ENV);
logger.info('app.get(\'env\') = %s', app.get('env'));

async function seedDB() {
  // Data seeder. see https://github.com/thosakwe/feathers-seeder
  // Also see possible data patterns: https://github.com/marak/Faker.js
  const seeder = require('feathers-seeder');
  const USERS = {
    path: 'users',
    count: 2,
    template: {
      email: '{{internet.email}}',
      //username: '{{internet.userName}}',
      //name: '{{name.firstName}} {{name.lastName}}',
      password: '{{internet.password}}',
      //TODO: lastLogin: () => moment().subtract(7, 'days').format()
    },
    callback(user, seed) {
      // Create todos for each user
      return seed({
        delete: false,
        count: 1,
        path: 'todos',
        template: { title: 'Task {{commerce.productName}}', notes: 'Perform {{company.catchPhrase}}, then {{hacker.verb}}.', userId: user._id },
        // Note that hooks must be setup to pass given userId if no user is authenticated.
        params: {
          userId: user._id
        }
      });
    }
  };
  const services = [];
  services.push(USERS);
  logger.info('Seeding the database...');
  await app.configure(seeder(
    {
      delete: true,
      services
    }
    //  app.get('seeder')
  )).seed();
  logger.info('Done seeding the database.');
}

if (app.get('env') === 'production' || app.get('env') === 'test') {
  // No seeding
  run();
} else {
  // 'development', 'staging'
  seedDB().then( () =>
    run()
  ).catch( () => {} );
}

