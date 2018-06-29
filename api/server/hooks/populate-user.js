// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { app, method, result, params } = context;

    if (method !== 'remove') {
      // Make sure that we always have a list of todos either by wrapping
      // a single todo into an array or by getting the `data` from the `find` method's result
      const todos = (method === 'find') ? result.data : [result];

      // Asynchronously get user object from each todo's `userId`
      // and add it to the todo
      await Promise.all(todos.map(async todo => {
        // Also pass the original `params` to the service call
        // so that it has the same information available (e.g. who is requesting it)
        todo.user = await app.service('users').get(todo.userId, params);
      }));
    }
    // Best practice: hooks should always return the context
    return context;
  };
};
