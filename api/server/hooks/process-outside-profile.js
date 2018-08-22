// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { app, method, result, params } = context;

    if (method === 'create' || method === 'update') {

      if (context.data.github) {
        context.data.email = context.data.github.profile.emails[0].value;
      }

    }
    // Best practice: hooks should always return the context
    return context;
  };
};
