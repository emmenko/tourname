/**
 * Args:
 * - organizationKey
 * - tournamentId
 * - teamId
 * - memberId
 */
module.exports = (parent, args, context, info) =>
  context.db.mutation.updateTournament(
    {
      where: {
        id: args.tournamentId,
      },
      data: {
        teams: {
          update: {
            where: { id: args.teamId },
            data: {
              playerRefs: {
                disconnect: {
                  id: args.memberId,
                },
              },
            },
          },
        },
      },
    },
    info
  );
