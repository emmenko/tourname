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

  await context.db.mutation.createMemberRef({
    data: {
      auth0Id: args.memberId,
      role: 'Member',
      organization: { connect: { key: args.organizationKey } },
    },
  });

  return context.db.query.organization(
    { where: { key: args.organizationKey } },
    info
  );
};
