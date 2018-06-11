const { ValidationError } = require('../../utils/errors');

const isOrganizationKeyAvailable = async (args, context) => {
  const existingOrgForGivenKey = await context.db.query.organization({
    where: { key: args.key },
  });
  if (existingOrgForGivenKey)
    throw new ValidationError(
      `An organization for key "${args.key}" already exist`
    );
};

/**
 * Args:
 * - key
 * - name
 */
module.exports = async (parent, args, context, info) => {
  await isOrganizationKeyAvailable(args, context);

  return context.db.mutation.createOrganization(
    {
      data: {
        key: args.key,
        name: args.name,
        memberRefs: {
          create: [{ auth0Id: context.auth0Id, role: 'Admin' }],
        },
      },
    },
    info
  );
};
