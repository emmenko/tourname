const { ValidationError } = require('../../utils/errors');
const hasUserAccessToOrganization = require('../../validations/has-user-access-to-organization');

const isTeamSizeEqualOrGreaterThanOne = teamSize => {
  if (teamSize < 1)
    throw new ValidationError('Team size must be equal or greater than 1');
};

const mapByTeamSize = (size, mapFn) => {
  switch (size) {
    case 'Small':
      return Array.from(new Array(4)).map(mapFn);
    case 'Medium':
      return Array.from(new Array(8)).map(mapFn);
    case 'Large':
      return Array.from(new Array(16)).map(mapFn);
    case 'XLarge':
      return Array.from(new Array(32)).map(mapFn);
    default:
      // Ignore, we never get here
      throw new Error(`Unexpected tournament size: ${size}`);
  }
};

/**
 * Args:
 * - name
 * - size
 * - discipline
 * - organizationKey
 * - teamSize
 */
module.exports = async (parent, args, context, info) => {
  isTeamSizeEqualOrGreaterThanOne(args.teamSize);
  await hasUserAccessToOrganization(args, context);

  return context.db.mutation.createTournament(
    {
      data: {
        name: args.name,
        size: args.size,
        status: 'New',
        discipline: args.discipline,
        teamSize: args.teamSize,
        teams: { create: mapByTeamSize(args.size, () => ({})) },
        organization: { connect: { key: args.organizationKey } },
      },
    },
    info
  );
};
