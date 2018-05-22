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
    context.userId === args.memberAuth0Id
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
 * - memberAuth0Id
 */
module.exports = async (parent, args, context, info) => {
  await isTargetMemberNotSelfAndNotLastAdmin(args, context);

  const matchingMembers = await context.db.query.memberRefs(
    {
      where: {
        AND: [
          { auth0Id: args.memberAuth0Id },
          { organization: { key: args.organizationKey } },
        ],
      },
    },
    '{ id }'
  );

  if (matchingMembers.length === 0)
    throw new ValidationError(
      `The member "${
        args.memberAuth0Id
      }" you are trying to remove is not part of the organization "${
        args.organizationKey
      }".`
    );

  return context.db.mutation.updateOrganization(
    {
      where: { key: args.organizationKey },
      data: {
        memberRefs: {
          delete: { id: matchingMembers[0] },
        },
      },
    },
    info
  );
};
