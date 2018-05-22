const { ValidationError } = require('../../utils/errors');

/**
 * Args:
 * - organizationKey
 * - matchId
 * - teamWinnerId
 */
module.exports = async (parent, args, context, info) => {
  const singleMatch = await context.db.query.matchSingle(
    {
      where: { id: args.matchId },
    },
    '{ id teamLeft { id } teamRight { id } winner { id } }'
  );
  if (!singleMatch)
    throw new ValidationError(
      `Cannot find single match with id "${args.matchId}"`
    );
  if (singleMatch.winner)
    throw new ValidationError(
      `The single match with id "${args.matchId}" already has a winner`
    );
  const isTeamWinnerIdValid =
    singleMatch.teamLeft.id === args.teamWinnerId ||
    singleMatch.teamRight.id === args.teamWinnerId;
  if (!isTeamWinnerIdValid)
    throw new Error(
      `Cannot set a winner as there is no team matching the id "${
        args.teamWinnerId
      }"`
    );
  return context.db.mutation.updateMatchSingle(
    {
      where: { id: args.matchId },
      data: {
        status: 'Finished',
        winner: { connect: { id: args.teamWinnerId } },
      },
    },
    info
  );
};
