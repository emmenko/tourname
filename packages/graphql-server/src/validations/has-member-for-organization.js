const { ValidationError } = require('../utils/errors');

module.exports = async (args, context) => {
  const matchingMembers = await context.db.query.memberRefs(
    {
      where: {
        AND: [
          { auth0Id: args.memberAuth0Id },
          { organization: { key: args.organizationKey } },
        ],
      },
    },
    '{ id }'
  );

  if (matchingMembers.length > 0)
    throw new ValidationError(
      `The member "${
        context.memberAuth0Id
      }" is already part of the organization "${args.organizationKey}".`
    );
};
