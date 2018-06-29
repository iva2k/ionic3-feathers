// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    // Our data model:
    //  _id: string;
    //  title: string;
    //  notes: string;
    // TODO: implement data-driven approach (based on schema?)

    // Throw an error if we didn't get all fields
    if (!context.data.title) {
      throw new Error('A todo must have a title');
    }
    if (!context.data.notes) {
      context.data.notes = '';
    }

    // The authenticated user. If no user, it is important for the seeder to pass given userId.
    const userId = context.params.user ? context.params.user._id : context.data.userId;

    const title = context.data.title
      // Titles can't be longer than 400 characters
      .substring(0, 400);

    const notes = context.data.notes
      // Notes can't be longer than 4096 characters
      .substring(0, 4096);

    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      title,
      notes,
      userId: userId,
      // Add the current date
      createdAt: new Date().getTime()
    };

    // Best practice: hooks should always return the context
    return context;
  };
};
