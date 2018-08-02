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

  if (process.env.NODE_ENV === 'development') {
    // Save local IP address and port to JSON file that client app can read. Simplify development config a bit.
    const internalIp = require('internal-ip');
    const path = require('path');
    const fs = require('fs');
    const outfile = path.join(app.get('www'), 'server.json');
    let ip4, ip6;
    internalIp.v6().then((ip) => {
      ip6=ip;
      return internalIp.v4();
    }).then((ip) => {
      ip4 = ip;
      console.log('Internal IP ipv4: ' + ip4 + ' ipv6: ' + ip6);
      let data = {
        ip4,
        ip6,
        port
      };
      fs.writeFile(outfile, JSON.stringify(data), function(err) {
        if (err) console.log(err);
        else console.log('Saved file %s', outfile);
      });
    });
  }
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

async function sendStartedEmail() {
  // Use the /emails service
  const crlf = '\r\n';
  const email_head = ''
    + '<!DOCTYPE html>' + crlf
    + '<html lang="en-US">' + crlf
    + '  <head>' + crlf
    + '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' + crlf
    + '  </head>' + crlf
    + '  <body>' + crlf;
  const email_tail = '' + crlf
    + '  </body>' + crlf
    + '</html>';
  const url = 'http://' + app.get('host') + ':' + app.get('port') + '/';
  const email = {
    from:    app.get('email_login'),
    to:      app.get('email_reports'),
    subject: '[ionic3-feathers] ' + app.get('env') + ' server started',
    html:    email_head + 'This is just to let you know that Feathers ' + app.get('env') + ' server has started for ionic3-feathers app on <a href="' + url + '">' + url + '</a>.' + email_tail
  };
  console.log('Email composed: %o', email);
  return app.service('emails').create(email).then(function (result) {
    console.log('Sent email', result);
  }).catch(err => {
    console.error(err);
  });
}

if (app.get('env') === 'production' || app.get('env') === 'test') {
  // 'production', 'test' - No seeding
  run();
} else {
  // 'development', 'staging' - Seed DB
  seedDB().then( () =>
    sendStartedEmail().then( () =>
      run()
    )).catch( logger.error );
}
