const { ValidationError } = require('../../utils/errors');
const isUserAdminOfOrganization = require('../../validations/is-user-admin-of-organization');

const isTargetMemberNotSelf = (args, context) => {
  if (context.userId === args.memberId)
    throw new ValidationError(
      `You cannot set yourself admin of the organization "${
        args.organizationKey
      }"`
    );
};
const isTargetMemberNotAnAdmin = async (args, context) => {
  const memberAdminResult = await context.db.query.memberRefs({
    where: {
      AND: [
        { auth0Id: args.memberId },
        { organization: { key: args.organizationKey } },
      ],
    },
  });
  if (memberAdminResult && memberAdminResult.length === 0)
    throw new ValidationError(
      `The member you are trying to promote "${
        args.memberId
      }" is not part of the organization "${args.organizationKey}"`
    );
  if (memberAdminResult && memberAdminResult[0].role === 'Admin')
    throw new ValidationError(
      `The member you are trying to promote "${
        args.memberId
      }" has already the role "Admin" of the organization "${
        args.organizationKey
      }"`
    );
};

/**
 * Only admin members can set other members as admin.
 *
 * Args:
 * - organizationKey
 * - memberId
 */
module.exports = async (parent, args, context, info) => {
  isTargetMemberNotSelf(args, context);
  await isUserAdminOfOrganization(args, context);
  await isTargetMemberNotAnAdmin(args, context);

  await context.db.mutation.updateManyMemberRefs({
    where: {
      AND: [
        { auth0Id: args.memberId },
        { organization: { key: args.organizationKey } },
      ],
    },
    data: {
      role: 'Admin',
    },
  });

  return context.db.query.organization(
    {
      where: { key: args.organizationKey },
    },
    info
  );
};
