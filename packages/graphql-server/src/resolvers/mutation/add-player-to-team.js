/**
 * Args:
 * - organizationKey
 * - tournamentId
 * - teamId
 * - memberId
 */
module.exports = (parent, args, context, info) =>
  // TODO:
  // * check if the player is already part of another team?
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
                connect: {
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
