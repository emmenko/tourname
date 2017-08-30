const uuid = require('uuid/v4');
const shuffle = require('lodash.shuffle');

const tournamentSizeMap = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 16,
  XLARGE: 32,
};

const randomToken = length =>
  Math.random()
    .toString(36)
    .substr(2, length);

const generateEmptyTeamsForTournament = size =>
  Array.from(new Array(size)).reduce(
    acc => Object.assign({}, acc, { [randomToken(6)]: [] }),
    {}
  );

module.exports = {
  Query: {
    tournament: (obj, args, context) =>
      context.loaders.tournaments.findOneCachedById(args.id),
  },
  PlayerInfo: {
    id: obj => obj._id,
  },
  Team: {
    players: (obj, args, context) => {
      if (obj.players.length > 0)
        return context.loaders.users
          .find({ _id: { $in: obj.players } })
          .toArray();
      return [];
    },
  },
  Match: {
    id: obj => obj._id,
  },
  Tournament: {
    __resolveType: obj => {
      if ({}.hasOwnProperty.call(obj, 'matchesLeg5')) {
        return 'TournamentXLarge';
      }
      if (
        {}.hasOwnProperty.call(obj, 'matchesLeg4') &&
        !{}.hasOwnProperty.call(obj, 'matchesLeg5')
      ) {
        return 'TournamentLarge';
      }
      if (
        {}.hasOwnProperty.call(obj, 'matchesLeg3') &&
        !{}.hasOwnProperty.call(obj, 'matchesLeg4') &&
        !{}.hasOwnProperty.call(obj, 'matchesLeg5')
      ) {
        return 'TournamentMedium';
      }
      if (
        {}.hasOwnProperty.call(obj, 'matchesLeg2') &&
        !{}.hasOwnProperty.call(obj, 'matchesLeg3') &&
        !{}.hasOwnProperty.call(obj, 'matchesLeg4') &&
        !{}.hasOwnProperty.call(obj, 'matchesLeg5')
      ) {
        return 'TournamentSmall';
      }
      return null;
    },
    id: obj => obj._id,
  },
  TournamentInfo: {
    id: obj => obj._id,
  },
  TournamentSmall: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches.findOneCachedById(obj.matchesLeg2),
  },
  TournamentMedium: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg2 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg3: (obj, args, context) =>
      context.loaders.matches.findOneCachedById(obj.matchesLeg3),
  },
  TournamentLarge: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg2 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg3: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg3 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg4: (obj, args, context) =>
      context.loaders.matches.findOneCachedById(obj.matchesLeg4),
  },
  TournamentXLarge: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg2 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg3: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg3 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg4: (obj, args, context) =>
      context.loaders.matches
        .find({ _id: { $in: obj.matchesLeg4 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg5: (obj, args, context) =>
      context.loaders.matches.findOneCachedById(obj.matchesLeg5),
  },
  Mutation: {
    createSmallTournament: async (obj, args, context) => {
      if (args.teamSize < 1)
        throw new Error('Team size must be equal or greater than 1');
      const isoDate = new Date().toISOString();
      const doc = await context.loaders.tournaments.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'SMALL',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        teamSize: args.teamSize,
        teams: generateEmptyTeamsForTournament(tournamentSizeMap.SMALL),
        matchesLeg1: [],
        matchesLeg2: null,
      });
      return context.loaders.tournaments.findOneCachedById(doc.insertedId);
    },
    createMediumTournament: async (obj, args, context) => {
      if (args.teamSize < 1)
        throw new Error('Team size must be equal or greater than 1');
      const isoDate = new Date().toISOString();
      const doc = await context.loaders.tournaments.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'MEDIUM',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        teamSize: args.teamSize,
        teams: generateEmptyTeamsForTournament(tournamentSizeMap.MEDIUM),
        matchesLeg1: [],
        matchesLeg2: [],
        matchesLeg3: null,
      });
      return context.loaders.tournaments.findOneCachedById(doc.insertedId);
    },
    createLargeTournament: async (obj, args, context) => {
      if (args.teamSize < 1)
        throw new Error('Team size must be equal or greater than 1');
      const isoDate = new Date().toISOString();
      const doc = await context.loaders.tournaments.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'LARGE',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        teamSize: args.teamSize,
        teams: generateEmptyTeamsForTournament(tournamentSizeMap.LARGE),
        matchesLeg1: [],
        matchesLeg2: [],
        matchesLeg3: [],
        matchesLeg4: null,
      });
      return context.loaders.tournaments.findOneCachedById(doc.insertedId);
    },
    createXLargeTournament: async (obj, args, context) => {
      if (args.teamSize < 1)
        throw new Error('Team size must be equal or greater than 1');
      const isoDate = new Date().toISOString();
      const doc = await context.loaders.tournaments.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'XLARGE',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        teamSize: args.teamSize,
        teams: generateEmptyTeamsForTournament(tournamentSizeMap.XLARGE),
        matchesLeg1: [],
        matchesLeg2: [],
        matchesLeg3: [],
        matchesLeg4: [],
        matchesLeg5: null,
      });
      return context.loaders.tournaments.findOneCachedById(doc.insertedId);
    },
    addPlayerToTeam: async (obj, args, context) => {
      const doc = await context.loaders.tournaments.findOneCachedById(
        args.tournamentId
      );

      if (doc.status !== 'NEW')
        throw new Error('Cannot change a team once a tournament is started');

      const hasNoMoreSlotsAvailable = Object.values(doc.teams).every(
        players => players.length === doc.teamSize
      );
      if (hasNoMoreSlotsAvailable)
        throw new Error('There are no more slots avaiable in a team');

      const selectedTeam = doc.teams[args.key];
      if (!selectedTeam)
        throw new Error(`Cannot find team with key "${args.key}"`);
      const hasRequestedTeamAvailableSlots = selectedTeam.length < doc.teamSize;
      if (!hasRequestedTeamAvailableSlots)
        throw new Error(
          `The team "${args.key}" does not have any more available slots for new players`
        );

      // TODO: validate
      // - throw if user is not found
      const isoDate = new Date().toISOString();
      await context.loaders.tournaments.updateOne(
        { _id: args.tournamentId },
        {
          $set: { lastModifiedAt: isoDate },
          $addToSet: { [`teams.${args.key}`]: args.playerId },
        }
      );
      return context.loaders.tournaments.findOneCachedById(args.tournamentId);
    },
    removePlayerFromTeam: async (obj, args, context) => {
      const doc = await context.loaders.tournaments.findOneCachedById(
        args.tournamentId
      );

      if (doc.status !== 'NEW')
        throw new Error('Cannot change a team once a tournament is started');

      const selectedTeam = doc.teams[args.key];
      if (!selectedTeam)
        throw new Error(`Cannot find team with key "${args.key}"`);
      const isPlayerInSelectedTeam = selectedTeam.find(
        playerId => playerId === args.playerId
      );
      if (!isPlayerInSelectedTeam)
        throw new Error(
          `The player "${args.playerId}" is not part of team "${args.key}", therefore it cannot be removed`
        );

      const isoDate = new Date().toISOString();
      await context.loaders.tournaments.updateOne(
        { _id: args.tournamentId },
        {
          $set: { lastModifiedAt: isoDate },
          $pull: { [`teams.${args.key}`]: args.playerId },
        }
      );
      return context.loaders.tournaments.findOneCachedById(args.tournamentId);
    },
    // Will create the first matches of leg1 and change the status to "IN_PROGRESS"
    // NOTE: this can be triggered only when the tournament has the correct amount
    // of players
    startTournament: async (obj, args, context) => {
      const doc = await context.loaders.tournaments.findOneCachedById(
        args.tournamentId
      );

      const hasNoMoreSlotsAvailable = Object.values(doc.teams).every(
        players => players.length === doc.teamSize
      );
      if (!hasNoMoreSlotsAvailable)
        throw new Error(
          `A tournament can be start once all teams have enough number of players (${doc.teamSize})`
        );

      const teamsKeys = Object.keys(doc.teams);
      // Shuffle the list of teams to randomly determine first matches
      const shuffledListOfTeams = shuffle(
        teamsKeys.map(key => ({ key, players: doc.teams[key] }))
      );
      // Build a list of matches pairs by picking two adiacent players
      const matchesPairs = shuffledListOfTeams.reduce((acc, _, index) => {
        if (index % 2 === 0)
          acc.push(shuffledListOfTeams.slice(index, index + 2));
        return acc;
      }, []);

      const numberOfMatches = teamsKeys.length - 1;
      // Create all (empty) matches for this tournament
      const emptyMatchesDocs = await context.loaders.matches.insertMany(
        Array.from(new Array(numberOfMatches)).map(() => {
          const isoDate = new Date().toISOString();
          return {
            _id: uuid(),
            createdAt: isoDate,
            lastModifiedAt: isoDate,
            teamLeft: null,
            teamRight: null,
            winner: null,
            nextMatchId: null,
            tournamentId: args.tournamentId,
            discipline: doc.discipline,
          };
        })
      );
      // Set relationships of matches
      const matchesIds = emptyMatchesDocs.insertedIds;
      let groupedMatchesByLeg;
      let matchesToUpdate;
      switch (doc.size) {
        case 'SMALL': {
          // start from top to bottom (final, semifinal, ...)
          const matchesLeg2 = matchesIds.splice(-1);
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId: matchesLeg2[0],
            teamLeft: matchesPairs[index][0],
            teamRight: matchesPairs[index][1],
          }));
          // store results
          groupedMatchesByLeg = {
            matchesLeg2: matchesLeg2[0],
            matchesLeg1: matchesLeg1.map(match => match.id),
          };
          matchesToUpdate = matchesLeg1;
          break;
        }
        case 'MEDIUM': {
          // start from top to bottom (final, semifinal, ...)
          const matchesLeg3 = matchesIds.splice(-1);
          const matchesLeg2 = matchesIds.splice(-2).map(id => ({
            id,
            nextMatchId: matchesLeg3[0],
            teamLeft: null,
            teamRight: null,
          }));
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg2[index] : matchesLeg2[index - 1],
            teamLeft: matchesPairs[index][0],
            teamRight: matchesPairs[index][1],
          }));
          // store results
          groupedMatchesByLeg = {
            matchesLeg3: matchesLeg3[0],
            matchesLeg2: matchesLeg2.map(match => match.id),
            matchesLeg1: matchesLeg1.map(match => match.id),
          };
          matchesToUpdate = matchesLeg2.concat(matchesLeg1);
          break;
        }
        case 'LARGE': {
          // start from top to bottom (final, semifinal, ...)
          const matchesLeg4 = matchesIds.splice(-1);
          const matchesLeg3 = matchesIds.splice(-2).map(id => ({
            id,
            nextMatchId: matchesLeg4[0],
            teamLeft: null,
            teamRight: null,
          }));
          const matchesLeg2 = matchesIds.splice(-4).map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg3[index] : matchesLeg3[index - 1],
            teamLeft: null,
            teamRight: null,
          }));
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg2[index] : matchesLeg2[index - 1],
            teamLeft: matchesPairs[index][0],
            teamRight: matchesPairs[index][1],
          }));
          // store results
          groupedMatchesByLeg = {
            matchesLeg4: matchesLeg4[0],
            matchesLeg3: matchesLeg3.map(match => match.id),
            matchesLeg2: matchesLeg2.map(match => match.id),
            matchesLeg1: matchesLeg1.map(match => match.id),
          };
          matchesToUpdate = matchesLeg3.concat(matchesLeg2).concat(matchesLeg1);
          break;
        }
        case 'XLARGE': {
          // start from top to bottom (final, semifinal, ...)
          const matchesLeg5 = matchesIds.splice(-1);
          const matchesLeg4 = matchesIds.splice(-2).map((id, index) => ({
            id,
            nextMatchId: matchesLeg5[0],
            teamLeft: matchesPairs[index][0],
            teamRight: matchesPairs[index][1],
          }));
          const matchesLeg3 = matchesIds.splice(-4).map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg4[index] : matchesLeg4[index - 1],
            teamLeft: null,
            teamRight: null,
          }));
          const matchesLeg2 = matchesIds.splice(-8).map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg3[index] : matchesLeg3[index - 1],
            teamLeft: null,
            teamRight: null,
          }));
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg2[index] : matchesLeg2[index - 1],
            teamLeft: matchesPairs[index][0],
            teamRight: matchesPairs[index][1],
          }));
          // store results
          groupedMatchesByLeg = {
            matchesLeg5: matchesLeg5[0],
            matchesLeg4: matchesLeg4.map(match => match.id),
            matchesLeg3: matchesLeg3.map(match => match.id),
            matchesLeg2: matchesLeg2.map(match => match.id),
            matchesLeg1: matchesLeg1.map(match => match.id),
          };
          matchesToUpdate = matchesLeg4
            .concat(matchesLeg3)
            .concat(matchesLeg2)
            .concat(matchesLeg1);
          break;
        }
        default:
        // ignore, this should never happen
      }

      // Update the matches
      await Promise.all(
        matchesToUpdate.map(match => {
          const isoDate = new Date().toISOString();
          return context.loaders.matches.updateOne(
            { _id: match.id },
            {
              $set: {
                lastModifiedAt: isoDate,
                nextMatchId: match.nextMatchId,
                teamLeft: match.teamLeft,
                teamRight: match.teamRight,
              },
            }
          );
        })
      );

      // Update the tournament
      await context.loaders.tournaments.updateOne(
        { _id: args.tournamentId },
        {
          $set: Object.assign(
            {
              lastModifiedAt: new Date().toISOString(),
              status: 'IN_PROGRESS',
            },
            groupedMatchesByLeg
          ),
        }
      );
      return context.loaders.tournaments.findOneCachedById(args.tournamentId);
    },
    // If it's the last match of a leg, the matches of the next leg level will be
    // created. If it's the last match of the tournament, the tournament will be
    // set as finished.
    // This action is irreversible, once the winner is set, it cannot be
    // changed.
    setMatchWinner: async (obj, args, context) => {
      const doc = await context.loaders.matches.findOneCachedById(args.matchId);

      // Check that the match had both players set in order to set the winner
      if (!doc.teamLeft || !doc.teamRight)
        throw new Error(`Cannot set match winner with only one team`);

      const teamWinner =
        doc.teamLeft[args.teamKey] || doc.teamRight[args.teamKey];
      if (!teamWinner)
        throw new Error(
          `Cannot set a winner as there is no team matching the key "${args.teamKey}"`
        );

      // Set the winner for the match
      await context.loaders.matches.updateOne(
        { _id: args.matchId },
        {
          $set: {
            lastModifiedAt: new Date().toISOString(),
            winner: teamWinner,
          },
        }
      );

      // If the match has a `nextMatchId`, assign the winner to that match
      // otherwise end the tournament.
      if (doc.nextMatchId) {
        const nextDoc = await context.loaders.matches.findOneCachedById(
          doc.nextMatchId
        );
        const teamFieldKey = nextDoc.teamLeft ? 'teamRight' : 'teamLeft';
        // Assign the winner to the next match
        await context.loaders.matches.updateOne(
          { _id: doc.nextMatchId },
          {
            $set: {
              lastModifiedAt: new Date().toISOString(),
              [teamFieldKey]: doc[args.teamKey],
            },
          }
        );
      } else
        // End the tournament
        await context.loaders.tournaments.updateOne(
          { _id: args.tournamentId },
          {
            $set: {
              lastModifiedAt: new Date().toISOString(),
              status: 'FINISHED',
            },
          }
        );
      return context.loaders.tournaments.findOneCachedById(args.tournamentId);
    },
  },
};
