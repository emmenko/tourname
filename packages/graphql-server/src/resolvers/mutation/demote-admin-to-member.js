const { ValidationError } = require('../../utils/errors');
const isUserAdminOfOrganization = require('../../validations/is-user-admin-of-organization');

const isTargetMemberNotSelf = (args, context) => {
  if (context.userId === args.memberId)
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
        { auth0Id: args.memberId },
        { organization: { key: args.organizationKey } },
      ],
    },
  });
  if (memberResult && memberResult.length === 0)
    throw new ValidationError(
      `The member you are trying to demote "${
        args.memberId
      }" is not part of the organization "${args.organizationKey}"`
    );
  if (memberResult && memberResult[0].role === 'Member')
    throw new ValidationError(
      `The member you are trying to demote "${
        args.memberId
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
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  isTargetMemberNotSelf(args, context);
  await isUserAdminOfOrganization(args, context);
  await isTargetMemberAnAdmin(args, context);

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
