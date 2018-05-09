const { ValidationError } = require('../utils/errors');

module.exports = async (role, args, context) => {
  const organizationKey = args.organizationKey || args.key;
  const organizationResults = await context.db.query.organizations({
    where: {
      AND: [
        { key: organizationKey },
        {
          memberRefs_some: {
            AND: [
              { auth0Id: context.userId },
              role === 'Admin'
                ? { role: 'Admin' }
                : // Make `Admin` inclusive in all other cases
                  { role_in: ['Admin', role] },
            ],
          },
        },
      ],
    },
  });

  if (!organizationResults || organizationResults.length === 0)
    throw new ValidationError(
      `The organization with key "${organizationKey}" is either not found or you are not part of this organization.`
    );
};
