/**
 * Args:
 * - organizationKey
 * - tournamentId
 */
module.exports = (parent, args, context, info) =>
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
