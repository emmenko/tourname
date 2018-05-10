const { ValidationError } = require('../../utils/errors');

/**
 * Args:
 * - organizationKey
 * - tournamentId
 * - matchTournamentId
 * - teamWinnerId
 */
module.exports = async (parent, args, context, info) => {
  // Check that the tournament has started
  const tournament = await context.db.query.tournament(
    {
      where: { id: args.tournamentId },
    },
    'id status'
  );
  if (!tournament)
    throw new ValidationError(
      `The tournament with id "${args.tournamentId}" does not exist`
    );
  if (tournament.status !== 'InProgress')
    throw new ValidationError(
      `The tournament with id "${
        args.tournamentId
      }" has not started yet, therefore you cannot set a match winner yet`
    );

  const matchTournament = await context.db.query.matchTournament(
    {
      where: { id: args.matchTournamentId },
    },
    'id teamLeft { id } teamRight { id } winner { id } nextMatch { id teamLeft { id } teamRight { id } }'
  );
  if (!matchTournament)
    throw new ValidationError(
      `Cannot find match tournament with id "${args.matchTournamentId}"`
    );

  if (matchTournament.winner)
    throw new ValidationError(
      `The match tournament with id "${
        args.matchTournamentId
      }" already has a winner`
    );

  const isTeamWinnerIdValid =
    matchTournament.teamLeft.id === args.teamWinnerId ||
    matchTournament.teamRight.id === args.teamWinnerId;
  if (!isTeamWinnerIdValid)
    throw new Error(
      `Cannot set a winner as there is no team matching the id "${
        args.teamWinnerId
      }"`
    );

  await context.db.mutation.updateMatchTournament(
    {
      where: {
        id: args.matchTournamentId,
      },
      data: {
        winner: {
          connect: { id: args.teamWinnerId },
        },
      },
    },
    info
  );

  if (matchTournament.nextMatch) {
    // Set the winner to the referenced next match
    const shouldSetWinnerToNextMatchOnTeamLeft = Boolean(
      matchTournament.nextMatch.teamLeft
    );
    await context.db.mutation.updateMatchTournament({
      where: { id: matchTournament.nextMatch.id },
      data: shouldSetWinnerToNextMatchOnTeamLeft
        ? { teamLeft: { connect: { id: args.teamWinnerId } } }
        : { teamRight: { connect: { id: args.teamWinnerId } } },
    });
    return context.db.query.tournament(
      {
        where: { id: args.tournamentId },
      },
      info
    );
  }

  // End the tournament
  return context.db.mutation.updateTournament(
    {
      where: { id: args.tournamentId },
      data: {
        status: 'Finished',
      },
    },
    info
  );
};
