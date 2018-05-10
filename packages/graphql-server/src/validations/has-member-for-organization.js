const { ValidationError } = require('../utils/errors');

module.exports = async (args, context) => {
  const matchingMembers = await context.db.query.memberRefs(
    {
      where: {
        AND: [
          { auth0Id: context.userId },
          { organization: { key: args.organizationKey } },
        ],
      },
    },
    '{ id }'
  );

  if (matchingMembers.length > 0)
    throw new ValidationError(
      `The member "${context.userId}" is already part of the organization "${
        args.organizationKey
      }".`
    );
};
