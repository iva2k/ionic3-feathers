const todos = require('./todos/todos.service.js');
const users = require('./users/users.service.js');
const emails = require('./emails/emails.service.js');
const authManagement = require('./auth-management/auth-management.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(authManagement);
  app.configure(todos);
  app.configure(users);
  app.configure(emails);
};
