const { ValidationError } = require('../../utils/errors');

const isTargetMemberNotSelf = (args, context) => {
  if (context.userId === args.memberAuth0Id)
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
        { auth0Id: args.memberAuth0Id },
        { organization: { key: args.organizationKey } },
      ],
    },
  });
  if (memberAdminResult && memberAdminResult.length === 0)
    throw new ValidationError(
      `The member you are trying to promote "${
        args.memberAuth0Id
      }" is not part of the organization "${args.organizationKey}"`
    );
  if (memberAdminResult && memberAdminResult[0].role === 'Admin')
    throw new ValidationError(
      `The member you are trying to promote "${
        args.memberAuth0Id
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
 * - memberAuth0Id
 */
module.exports = async (parent, args, context, info) => {
  isTargetMemberNotSelf(args, context);
  await isTargetMemberNotAnAdmin(args, context);

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
