const { ValidationError } = require('../../utils/errors');
const hasUserAccessToOrganization = require('../../validations/has-user-access-to-organization');

const isTeamSizeEqualOrGreaterThanOne = teamSize => {
  if (teamSize < 1)
    throw new ValidationError('Team size must be equal or greater than 1');
};

/**
 * Args:
 * - name
 * - size
 * - discipline
 * - organizationKey
 * - teamSize
 */
module.exports = async (parent, args, context) => {
  isTeamSizeEqualOrGreaterThanOne(args.teamSize);
  await hasUserAccessToOrganization(args, context);

  return context.db.mutation.createTournament({
    data: {
      name: args.name,
      size: args.size,
      status: 'New',
      discipline: args.discipline,
      teamSize: args.teamSize,
      teams: { create: [] },
      organization: { connect: { key: args.organizationKey } },
    },
  });
};
