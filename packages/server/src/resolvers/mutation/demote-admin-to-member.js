const { ValidationError } = require('../../utils/errors');

const isTargetMemberNotSelf = (args, context) => {
  if (context.auth0Id === args.memberAuth0Id)
    throw new ValidationError(
      `You cannot demote yourself from admin of the organization "${
        args.organizationKey
      }"`
    );
};
const isTargetMemberAnAdmin = async (args, context) => {
  const memberResult = await context.db.query.memberRefs({
    where: {
      AND: [
        { auth0Id: args.memberAuth0Id },
        { organization: { key: args.organizationKey } },
      ],
    },
  });
  if (memberResult && memberResult.length === 0)
    throw new ValidationError(
      `The member you are trying to demote "${
        args.memberAuth0Id
      }" is not part of the organization "${args.organizationKey}"`
    );
  if (memberResult && memberResult[0].role === 'Member')
    throw new ValidationError(
      `The member you are trying to demote "${
        args.memberAuth0Id
      }" has already the role "Member" of the organization "${
        args.organizationKey
      }"`
    );
};

/**
 * Only admin members can demote other admins to members.
 *
 * Args:
 * - organizationKey
 * - memberAuth0Id
 */
module.exports = async (parent, args, context, info) => {
  isTargetMemberNotSelf(args, context);
  await isTargetMemberAnAdmin(args, context);

  return context.db.mutation.updateOrganization(
    {
      where: { key: args.organizationKey },
      data: {
        memberRefs: {
          update: {
            where: { auth0Id: args.memberAuth0Id },
            data: { role: 'Member' },
          },
        },
      },
    },
    info
  );
};
