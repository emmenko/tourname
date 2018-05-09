const isUserInAuth0 = require('../../validations/is-user-in-auth0');

/**
 * Only admin members can add other members to the organization
 *
 * Args:
 * - organizationKey
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  await isUserInAuth0(args, context);

  return context.db.mutation.updateOrganization(
    {
      where: { key: args.organizationKey },
      data: {
        memberRefs: {
          create: { auth0Id: args.memberId, role: 'Member' },
        },
      },
    },
    info
  );
};
