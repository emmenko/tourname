/**
 * Only admin members can demote other admins to members.
 *
 * Args:
 * - organizationKey
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  if (context.userId === args.memberId)
    throw new Error(
      `You cannot demote yourself from admin of the organization "${
        args.organizationKey
      }"`
    );

  // Check that the user has access to the given organization
  // and is an admin
  const organizationResults = await context.db.query.organizations({
    where: {
      AND: [
        { key: args.organizationKey },
        {
          memberRefs_some: {
            AND: [{ auth0Id: context.userId }, { role: 'Admin' }],
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
      }" is either not found or you are not an Admin of such organization. In case you are part of the organization, remember that only admin members can demote admins to member.`
    );

  // Check if the `memberId` is alredy Member
  const memberResult = await context.db.query.memberRefs({
    where: {
      AND: [
        { auth0Id: args.memberId },
        { organization: { key: args.organizationKey } },
      ],
    },
  });
  if (memberResult && memberResult.length === 0)
    throw new Error(
      `The member "${args.memberId}" is not part of the organization "${
        args.organizationKey
      }"`
    );
  if (memberResult && memberResult[0].role === 'Member')
    throw new Error(
      `The member "${
        args.memberId
      }" has already the role "Member" of the organization "${
        args.organizationKey
      }"`
    );

  await context.db.mutation.updateManyMemberRefs({
    where: {
      AND: [
        { auth0Id: args.memberId },
        { organization: { key: args.organizationKey } },
      ],
    },
    data: {
      role: 'Member',
    },
  });

  return context.db.query.organization(
    {
      where: { key: args.organizationKey },
    },
    info
  );
};
