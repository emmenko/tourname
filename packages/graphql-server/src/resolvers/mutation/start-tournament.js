/**
 * Args:
 * - organizationKey
 * - tournamentId
 */
module.exports = (parent, args, context, info) =>
  // TODO:
  // * create group matches based on tournament size
  context.db.mutation.updateTournament(
    {
      where: {
        id: args.tournamentId,
      },
      data: {
        status: 'InProgress',
      },
    },
    info
  );
