const shuffle = require('lodash.shuffle');
const { ValidationError } = require('../../utils/errors');

const createMatchPayload = ({ tournament, organizationKey, matchPair }) => {
  const [teamLeft, teamRight] = matchPair;
  return {
    tournament: { connect: { id: tournament.id } },
    discipline: tournament.discipline,
    organization: { connect: { key: organizationKey } },
    teamLeft: {
      connect: { id: teamLeft.id },
    },
    teamRight: {
      connect: { id: teamRight.id },
    },
  };
};

const createRoundFinalCreatePayload = ({
  organizationKey,
  tournamentId,
  match,
}) => ({
  roundFinal: {
    create: {
      match: {
        create: createMatchPayload({
          organizationKey,
          tournamentId,
          matchPair: match,
        }),
      },
    },
  },
});

const createRoundSemifinalsCreatePayload = ({
  organizationKey,
  tournamentId,
  matches,
}) => ({
  roundSemifinals: ['A', 'B'].reduce(
    (matchPayloads, matchSuffix, index) =>
      Object.assign({}, matchPayloads, {
        [`match${matchSuffix}`]: {
          create: createMatchPayload({
            organizationKey,
            tournamentId,
            matchPair: matches[index],
          }),
        },
      }),
    {}
  ),
});

const createRoundQuarterfinalsCreatePayload = ({
  organizationKey,
  tournamentId,
  matches,
}) => ({
  roundQuarterfinals: {
    create: ['A', 'B', 'C', 'D'].reduce(
      (matchPayloads, matchSuffix, index) =>
        Object.assign({}, matchPayloads, {
          [`match${matchSuffix}`]: {
            create: createMatchPayload({
              organizationKey,
              tournamentId,
              matchPair: matches[index],
            }),
          },
        }),
      {}
    ),
  },
});
const createRoundLastSixteenCreatePayload = ({
  organizationKey,
  tournamentId,
  matches,
}) => ({
  roundQuarterfinals: {
    create: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].reduce(
      (matchPayloads, matchSuffix, index) =>
        Object.assign({}, matchPayloads, {
          [`match${matchSuffix}`]: {
            create: createMatchPayload({
              organizationKey,
              tournamentId,
              matchPair: matches[index],
            }),
          },
        }),
      {}
    ),
  },
});

const createRoundsCreatePayloadBySize = ({
  organizationKey,
  tournament,
  matchesPairs,
}) => {
  const tournamentId = tournament.id;
  switch (tournament.size) {
    case 'Small': {
      const [match1, match2, matchFinal] = matchesPairs;
      return Object.assign(
        {},
        createRoundSemifinalsCreatePayload({
          organizationKey,
          tournamentId,
          matches: [match1, match2],
        }),
        createRoundFinalCreatePayload({
          organizationKey,
          tournamentId,
          match: matchFinal,
        })
      );
    }
    case 'Medium': {
      const [
        // Quarter finals
        match1,
        match2,
        match3,
        match4,
        // Semifinals
        match5,
        match6,
        matchFinal,
      ] = matchesPairs;
      return Object.assign(
        {},
        createRoundQuarterfinalsCreatePayload({
          organizationKey,
          tournamentId,
          matches: [match1, match2, match3, match4],
        }),
        createRoundSemifinalsCreatePayload({
          organizationKey,
          tournamentId,
          matches: [match5, match6],
        }),
        createRoundFinalCreatePayload({
          organizationKey,
          tournamentId,
          match: matchFinal,
        })
      );
    }
    case 'Large': {
      const [
        // Last sixteen
        match1,
        match2,
        match3,
        match4,
        match5,
        match6,
        match7,
        match8,
        // Quarter finals
        match9,
        match10,
        match11,
        match12,
        // Semifinals
        match13,
        match14,
        matchFinal,
      ] = matchesPairs;
      return Object.assign(
        {},
        createRoundLastSixteenCreatePayload({
          organizationKey,
          tournamentId,
          matches: [
            match1,
            match2,
            match3,
            match4,
            match5,
            match6,
            match7,
            match8,
          ],
        }),
        createRoundQuarterfinalsCreatePayload({
          organizationKey,
          tournamentId,
          matches: [match9, match10, match11, match12],
        }),
        createRoundSemifinalsCreatePayload({
          organizationKey,
          tournamentId,
          matches: [match13, match14],
        }),
        createRoundFinalCreatePayload({
          organizationKey,
          tournamentId,
          match: matchFinal,
        })
      );
    }
    default:
      // We should never get to this point, ignore
      return null;
  }
};

const createRoundsNextMatchesUpdatePayloadBySize = ({
  tournamentSize,
  roundQuarterfinals,
  roundSemifinals,
  roundFinal,
}) => {
  switch (tournamentSize) {
    case 'Small': {
      return {
        roundSemifinals: {
          update: {
            matchA: {
              update: {
                nextMatch: { connect: { id: roundFinal.match.id } },
              },
            },
            matchB: {
              update: {
                nextMatch: { connect: { id: roundFinal.match.id } },
              },
            },
          },
        },
      };
    }
    case 'Medium': {
      return {
        roundQuarterfinals: {
          update: {
            matchA: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchA.id } },
              },
            },
            matchB: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchA.id } },
              },
            },
            matchC: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchB.id } },
              },
            },
            matchD: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchB.id } },
              },
            },
          },
        },
        roundSemifinals: {
          update: {
            matchA: {
              update: {
                nextMatch: { connect: { id: roundFinal.match.id } },
              },
            },
            matchB: {
              update: {
                nextMatch: { connect: { id: roundFinal.match.id } },
              },
            },
          },
        },
      };
    }
    case 'Large': {
      return {
        roundLastSixteen: {
          update: {
            matchA: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchA.id } },
              },
            },
            matchB: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchA.id } },
              },
            },
            matchC: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchB.id } },
              },
            },
            matchD: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchB.id } },
              },
            },
            matchE: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchC.id } },
              },
            },
            matchF: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchC.id } },
              },
            },
            matchG: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchD.id } },
              },
            },
            matchH: {
              update: {
                nextMatch: { connect: { id: roundQuarterfinals.matchD.id } },
              },
            },
          },
        },
        roundQuarterfinals: {
          update: {
            matchA: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchA.id } },
              },
            },
            matchB: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchA.id } },
              },
            },
            matchC: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchB.id } },
              },
            },
            matchD: {
              update: {
                nextMatch: { connect: { id: roundSemifinals.matchB.id } },
              },
            },
          },
        },
        roundSemifinals: {
          update: {
            matchA: {
              update: {
                nextMatch: { connect: { id: roundFinal.match.id } },
              },
            },
            matchB: {
              update: {
                nextMatch: { connect: { id: roundFinal.match.id } },
              },
            },
          },
        },
      };
    }
    default:
      return null;
  }
};

/**
 * When a tournament starts, all necessary matches of the tournament are created.
 * The matches will be empty except for the first leg, where teams are randomly
 * assigned to each match. Additionally, those first matches will reference their
 * successive match (`nextMatchId`) to define the next match to play for the match
 * winner. In case a match does not have a `nextMatchId`, it's considered the
 * "final" match of the tournament.
 *
 * Args:
 * - organizationKey
 * - tournamentId
 */
module.exports = async (parent, args, context, info) => {
  const tournament = context.db.query.tournament(
    {
      where: { id: args.tournamentId },
    },
    'id status size teamSize teams { id playerRefs { id } }'
  );
  if (!tournament)
    throw new ValidationError(
      `The tournament with id "${args.tournamentId}" does not exist`
    );
  if (tournament.status !== 'New')
    throw new ValidationError(
      `Cannot start a tournament that is already started or finished`
    );

  const areAllTeamsReadyToPlay = tournament.teams.every(
    team => team.playerRefs.length === tournament.teamSize
  );
  if (!areAllTeamsReadyToPlay)
    throw new Error(
      `A tournament can be started once all teams have enough number of players (team size: ${
        tournament.teamSize
      })`
    );

  // Shuffle the list of teams to randomly determine first matches
  const shuffledListOfTeams = shuffle(tournament.teams);
  // Build a list of matches pairs by picking two adiacent teams
  const matchesPairs = shuffledListOfTeams.reduce(
    (updatedMatchesPairs, _, index) => {
      if (index % 2 === 0)
        updatedMatchesPairs.push(shuffledListOfTeams.slice(index, index + 2));
      return updatedMatchesPairs;
    },
    []
  );

  const updatedTournamentWithMatches = await context.db.mutation.updateTournament(
    {
      where: { id: args.tournamentId },
      data: createRoundsCreatePayloadBySize({
        organizationKey: args.organizationKey,
        tournament,
        matchesPairs,
      }),
    },
    `
    id
    roundLastSixteen {
      matchA { id }
      matchB { id }
      matchC { id }
      matchD { id }
      matchE { id }
      matchF { id }
      matchG { id }
      matchH { id }
    }
    roundQuarterfinals {
      matchA { id }
      matchB { id }
      matchC { id }
      matchD { id }
    }
    roundSemifinals {
      matchA { id }
      matchB { id }
    }
    roundFinal {
      match { id }
    }
    `
  );

  return context.db.mutation.updateTournament(
    {
      where: { id: args.tournamentId },
      data: Object.assign(
        {},
        {
          status: 'InProgress',
        },
        createRoundsNextMatchesUpdatePayloadBySize({
          tournamentSize: tournament.size,
          roundQuarterfinals: updatedTournamentWithMatches.roundQuarterfinals,
          roundSemifinals: updatedTournamentWithMatches.roundSemifinals,
          roundFinal: updatedTournamentWithMatches.roundFinal,
        })
      ),
    },
    info
  );
};
