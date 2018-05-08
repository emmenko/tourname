const { ValidationError } = require('../utils/errors');

module.exports = async (args, context) => {
  // TODO: find a better way to check if the user exists in auth0
  const targetUserDoc = await context.loaders.users.load(args.memberId);
  if (!targetUserDoc)
    throw new ValidationError(
      `The member "${args.memberId}" does not exist in the Identity Provider`
    );
};
