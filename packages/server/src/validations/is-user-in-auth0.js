const { ValidationError } = require('../utils/errors');

module.exports = async (args, context) => {
  // TODO: find a better way to check if the user exists in auth0
  const targetUserDoc = await context.loaders.users.load(args.memberAuth0Id);
  if (!targetUserDoc)
    throw new ValidationError(
      `The member "${
        args.memberAuth0Id
      }" does not exist in the Identity Provider`
    );
};
