const { createLogger, format, transports } = require('winston');

function getLogLevel() {
  let level = 'info'; // production
  if (process.env.NODE_ENV !== 'production') {
    level = 'debug'; // development, staging, test.
  }
  return level;
}

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  level: getLogLevel(),
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console()
  ],
});

module.exports = logger;
