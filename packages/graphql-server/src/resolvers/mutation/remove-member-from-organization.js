/**
 * Only admin members can remove other members from an organization.
 *
 * Args:
 * - organizationKey
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  // * only admin users can remove users from the organization
  // * validate that current user is admin.
  // * current user cannot remove itself, instead the org should be removed
  // * check that the user has access to the given organization
  const adminMembersOfOrganization = await context.db.query.memberRefs({
    where: {
      AND: [{ role: 'Admin' }, { organization: { key: args.organizationKey } }],
    },
  });
  if (!adminMembersOfOrganization || adminMembersOfOrganization.length === 0)
    // TODO: return proper status code
    throw new Error(
      `The organization with key "${args.organizationKey}" is not found.`
    );
  if (
    adminMembersOfOrganization &&
    !adminMembersOfOrganization.find(
      member => member.auth0Id === context.userId
    )
  )
    // TODO: return proper status code
    throw new Error(
      `You are not an Admin of the organization "${
        args.organizationKey
      }" and therefore cannot remove other members from the it.`
    );
  if (
    adminMembersOfOrganization &&
    adminMembersOfOrganization.length === 1 &&
    context.userId === args.memberId
  )
    // TODO: return proper status code
    throw new Error(
      `You are the only Admin of the organization "${
        args.organizationKey
      }" and cannot remove yourself. If you wish to do so, you should delete the organization.`
    );

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
