/**
 * Args:
 * - organizationKey
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  // Check that the user has access to the given organization
  const organizationResults = await context.db.query.organizations({
    where: {
      AND: [
        { key: args.organizationKey },
        {
          memberRefs_some: {
            auth0Id: context.userId,
          },
        },
      ],
    },
  });
  if (!organizationResults || organizationResults.length === 0)
    // TODO: return proper status code
    throw new Error(
      `The organization with key "${
        args.organizationKey
      }" is either not found or you are not part of such organization.`
    );

  // TODO: find a better way to check if the user exists in auth0
  const targetUserDoc = await context.loaders.users.load(args.memberId);
  if (!targetUserDoc)
    throw new Error(
      `The user "${args.memberId}" that you are trying to add does not exist`
    );

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
