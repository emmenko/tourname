const { ValidationError } = require('../utils/errors');

module.exports = async (args, context) => {
  // Check that the user has access to the given organization
  const organizationResults = await context.db.query.organizations({
    where: {
      AND: [
        { key: args.organizationKey },
        {
          memberRefs_some: {
            AND: [{ auth0Id: context.userId }],
          },
        },
      ],
    },
  });

  if (!organizationResults || organizationResults.length === 0)
    throw new ValidationError(
      `The organization with key "${
        args.organizationKey
      }" is either not found or you are not part of this organization.`
    );
};
