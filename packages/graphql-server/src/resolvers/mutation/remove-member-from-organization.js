const { ValidationError } = require('../../utils/errors');

const isTargetMemberNotSelfAndNotLastAdmin = async (args, context) => {
  const adminMembersOfOrganization = await context.db.query.memberRefs({
    where: {
      AND: [{ role: 'Admin' }, { organization: { key: args.organizationKey } }],
    },
  });
  if (
    adminMembersOfOrganization &&
    adminMembersOfOrganization.length === 1 &&
    context.userId === args.memberId
  )
    throw new ValidationError(
      `You are the only Admin of the organization "${
        args.organizationKey
      }" and cannot remove yourself. If you wish to do so, you should delete the organization.`
    );
};

/**
 * Only admin members can remove other members from an organization.
 *
 * Args:
 * - organizationKey
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  await isTargetMemberNotSelfAndNotLastAdmin(args, context);

  await context.db.mutation.deleteManyMemberRefs({
    where: {
      AND: [
        { auth0Id: args.memberId },
        { organization: { key: args.organizationKey } },
      ],
    },
  });

  return context.db.query.organization(
    { where: { key: args.organizationKey } },
    info
  );
};
