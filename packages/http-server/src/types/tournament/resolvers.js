const uuid = require('uuid/v4');
const shuffle = require('lodash.shuffle');

const TOURNAMENT_SMALL = 'SMALL';
const TOURNAMENT_MEDIUM = 'MEDIUM';
const TOURNAMENT_LARGE = 'LARGE';
const TOURNAMENT_XLARGE = 'XLARGE';

const tournamentSizeMap = {
  [TOURNAMENT_SMALL]: 4,
  [TOURNAMENT_MEDIUM]: 8,
  [TOURNAMENT_LARGE]: 16,
  [TOURNAMENT_XLARGE]: 32,
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

const mapMatchIdToMatchDefinition = (
  ids,
  mapIndexToNextMatchId,
  matchesPairs
) =>
  ids.map((id, index) => ({
    id,
    nextMatchId: mapIndexToNextMatchId(index),
    teamLeft: matchesPairs ? matchesPairs[index][0] : null,
    teamRight: matchesPairs ? matchesPairs[index][1] : null,
  }));

const extractMatchesByLegs = (size, matchesIds, matchesPairs) => {
  const matchesByLegs = {};
  switch (size) {
    case TOURNAMENT_SMALL:
      // Finals
      matchesByLegs.matchesLeg2 = matchesIds.splice(-1);
      // Semifinals
      matchesByLegs.matchesLeg1 = mapMatchIdToMatchDefinition(
        matchesIds,
        () => matchesByLegs.matchesLeg2[0],
        matchesPairs
      );
      break;
    case TOURNAMENT_MEDIUM:
      // Finals
      matchesByLegs.matchesLeg3 = matchesIds.splice(-1);
      // Semifinals
      matchesByLegs.matchesLeg2 = mapMatchIdToMatchDefinition(
        matchesIds.splice(-2),
        matchesByLegs.matchesLeg3[0]
      );
      // Quarterfinals
      matchesByLegs.matchesLeg1 = mapMatchIdToMatchDefinition(
        matchesIds,
        index =>
          index % 2 === 0
            ? matchesByLegs.matchesLeg2[index]
            : matchesByLegs.matchesLeg2[index - 1],
        matchesPairs
      );
      break;
    case TOURNAMENT_LARGE:
      // Finals
      matchesByLegs.matchesLeg4 = matchesIds.splice(-1);
      // Semifinals
      matchesByLegs.matchesLeg3 = mapMatchIdToMatchDefinition(
        matchesIds.splice(-2),
        matchesByLegs.matchesLeg4[0]
      );
      // Quarterfinals
      matchesByLegs.matchesLeg2 = mapMatchIdToMatchDefinition(
        matchesIds.splice(-4),
        index =>
          index % 2 === 0
            ? matchesByLegs.matchesLeg3[index]
            : matchesByLegs.matchesLeg3[index - 1]
      );
      // Round of 16
      matchesByLegs.matchesLeg1 = mapMatchIdToMatchDefinition(
        matchesIds,
        index =>
          index % 2 === 0
            ? matchesByLegs.matchesLeg2[index]
            : matchesByLegs.matchesLeg2[index - 1],
        matchesPairs
      );
      break;
    case TOURNAMENT_XLARGE:
      // Finals
      matchesByLegs.matchesLeg5 = matchesIds.splice(-1);
      // Semifinals
      matchesByLegs.matchesLeg4 = mapMatchIdToMatchDefinition(
        matchesIds.splice(-2),
        matchesByLegs.matchesLeg5[0]
      );
      // Quarterfinals
      matchesByLegs.matchesLeg3 = mapMatchIdToMatchDefinition(
        matchesIds.splice(-4),
        index =>
          index % 2 === 0
            ? matchesByLegs.matchesLeg4[index]
            : matchesByLegs.matchesLeg4[index - 1]
      );
      // Round of 16
      matchesByLegs.matchesLeg2 = mapMatchIdToMatchDefinition(
        matchesIds.splice(-8),
        index =>
          index % 2 === 0
            ? matchesByLegs.matchesLeg3[index]
            : matchesByLegs.matchesLeg3[index - 1]
      );
      // Round of 32
      matchesByLegs.matchesLeg1 = mapMatchIdToMatchDefinition(
        matchesIds,
        index =>
          index % 2 === 0
            ? matchesByLegs.matchesLeg2[index]
            : matchesByLegs.matchesLeg2[index - 1],
        matchesPairs
      );
      break;
    default:
    // ignore
  }
  return matchesByLegs;
};

const mapMatchesToUpdate = (size, groupedMatchesByLeg) => {
  switch (size) {
    case TOURNAMENT_SMALL:
      return groupedMatchesByLeg.matchesLeg1;
    case TOURNAMENT_MEDIUM:
      return groupedMatchesByLeg.matchesLeg2.concat(
        groupedMatchesByLeg.matchesLeg1
      );
    case TOURNAMENT_LARGE:
      return groupedMatchesByLeg.matchesLeg3
        .concat(groupedMatchesByLeg.matchesLeg2)
        .concat(groupedMatchesByLeg.matchesLeg1);
    case TOURNAMENT_XLARGE:
      return groupedMatchesByLeg.matchesLeg4
        .concat(groupedMatchesByLeg.matchesLeg3)
        .concat(groupedMatchesByLeg.matchesLeg2)
        .concat(groupedMatchesByLeg.matchesLeg1);
    default:
      // ignore
      return [];
  }
};

module.exports = {
  Query: {
    tournament: (obj, args, context) =>
      context.loaders.tournaments.load(args.id),
  },
  PlayerInfo: {
    id: obj => obj.user_id, // The `user_id` field comes from auth0
  },
  Team: {
    players: (obj, args, context) => {
      if (obj.players.length > 0)
        return context.loaders.users.loadMany(obj.players);
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
      context.loaders.matches.loadMany(obj.matchesLeg1),
    matchesLeg2: (obj, args, context) =>
      obj.matchesLeg2 && context.loaders.matches.load(obj.matchesLeg2),
  },
  TournamentMedium: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg1),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg2),
    matchesLeg3: (obj, args, context) =>
      obj.matchesLeg3 && context.loaders.matches.load(obj.matchesLeg3),
  },
  TournamentLarge: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg1),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg2),
    matchesLeg3: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg3),
    matchesLeg4: (obj, args, context) =>
      obj.matchesLeg4 && context.loaders.matches.load(obj.matchesLeg4),
  },
  TournamentXLarge: {
    id: obj => obj._id,
    teams: obj =>
      Object.keys(obj.teams).map(key => ({ key, players: obj.teams[key] })),
    matchesLeg1: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg1),
    matchesLeg2: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg2),
    matchesLeg3: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg3),
    matchesLeg4: (obj, args, context) =>
      context.loaders.matches.loadMany(obj.matchesLeg4),
    matchesLeg5: (obj, args, context) =>
      obj.matchesLeg5 && context.loaders.matches.load(obj.matchesLeg5),
  },
  Mutation: {
    createTournament: async (obj, args, context) => {
      // Check that the user has access to the given organization
      const organizationDoc = await context.loaders.organizations.load(
        args.organizationKey
      );
      if (!organizationDoc)
        // TODO: return proper status code
        throw new Error('Unauthorized');

      if (args.teamSize < 1)
        throw new Error('Team size must be equal or greater than 1');

      let legs;
      switch (args.size) {
        case TOURNAMENT_SMALL:
          legs = {
            matchesLeg1: [],
            matchesLeg2: null,
          };
          break;
        case TOURNAMENT_MEDIUM:
          legs = {
            matchesLeg1: [],
            matchesLeg2: [],
            matchesLeg3: null,
          };
          break;
        case TOURNAMENT_LARGE:
          legs = {
            matchesLeg1: [],
            matchesLeg2: [],
            matchesLeg3: [],
            matchesLeg4: null,
          };
          break;
        case TOURNAMENT_XLARGE:
          legs = {
            matchesLeg1: [],
            matchesLeg2: [],
            matchesLeg3: [],
            matchesLeg4: [],
            matchesLeg5: null,
          };
          break;
        default:
          // Ignore, we never get here
          throw new Error(`Unexpected tournament size: ${args.size}`);
      }

      const isoDate = new Date().toISOString();
      const doc = await context.db.tournaments.insertOne(
        Object.assign(
          {
            _id: uuid(),
            createdAt: isoDate,
            lastModifiedAt: isoDate,
            size: args.size,
            discipline: args.discipline,
            name: args.name,
            organizationKey: args.organizationKey,
            status: 'NEW',
            teamSize: args.teamSize,
            teams: generateEmptyTeamsForTournament(
              tournamentSizeMap[args.size]
            ),
          },
          legs
        )
      );
      return context.loaders.tournaments.load(doc.insertedId);
    },
    /**
     * Args:
     * - tournamentId
     * - teamKey
     * - playerId
     */
    addPlayerToTeam: async (obj, args, context) => {
      const doc = await context.loaders.tournaments.load(args.tournamentId);
      if (!doc)
        throw new Error(
          `Cannot find tournament with id "${args.tournamentId}"`
        );
      if (doc.status !== 'NEW')
        throw new Error('Cannot change a team once a tournament is started');

      const selectedTeam = doc.teams[args.teamKey];
      if (!selectedTeam)
        throw new Error(`Cannot find team with key "${args.teamKey}"`);
      const hasSelectedTeamAvailableSlots = selectedTeam.length < doc.teamSize;
      if (!hasSelectedTeamAvailableSlots)
        throw new Error(
          `Cannot add a new player to the team "${args.teamKey}" as the team is already full of players`
        );

      // TODO: find a better way to check if the user exists in auth0
      const userDoc = await context.loaders.users.load(args.playerId);
      if (!userDoc)
        throw new Error(`Cannot find user with id "${args.playerId}"`);

      const isoDate = new Date().toISOString();
      await context.db.tournaments.updateOne(
        { _id: args.tournamentId },
        {
          $set: { lastModifiedAt: isoDate },
          $addToSet: { [`teams.${args.teamKey}`]: args.playerId },
        }
      );
      return context.loaders.tournaments
        .clear(args.tournamentId)
        .load(args.tournamentId);
    },
    /**
     * Args:
     * - tournamentId
     * - teamKey
     * - playerId
     */
    removePlayerFromTeam: async (obj, args, context) => {
      const doc = await context.loaders.tournaments.load(args.tournamentId);
      if (!doc)
        throw new Error(
          `Cannot find tournament with id "${args.tournamentId}"`
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
      await context.db.tournaments.updateOne(
        { _id: args.tournamentId },
        {
          $set: { lastModifiedAt: isoDate },
          $pull: { [`teams.${args.key}`]: args.playerId },
        }
      );
      return context.loaders.tournaments
        .clear(args.tournamentId)
        .load(args.tournamentId);
    },
    /**
     * When a tournament starts, all necessary matches of the tournament are created.
     * The matches will be empty except for the first leg, where teams are randomly
     * assigned to each match. Additionally, those first matches will reference their
     * successive match (`nextMatchId`) to define the next match to play for the match
     * winner. In case a match does not have a `nextMatchId`, it's considered the
     * "final" match of the tournament.
     * 
     * Args:
     * - tournamentId
     */
    startTournament: async (obj, args, context) => {
      const doc = await context.loaders.tournaments.load(args.tournamentId);
      if (!doc)
        throw new Error(
          `Cannot find tournament with id "${args.tournamentId}"`
        );
      if (doc.status !== 'NEW')
        throw new Error(
          `Cannot start a tournament that is already started or finished`
        );

      const areAllTeamsReadyToPlay = Object.values(doc.teams).every(
        players => players.length === doc.teamSize
      );
      if (!areAllTeamsReadyToPlay)
        throw new Error(
          `A tournament can be started once all teams have enough number of players (team size: ${doc.teamSize})`
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
      const emptyMatchesDocs = await context.db.matches.insertMany(
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
            organizationKey: doc.organizationKey,
            tournamentId: args.tournamentId,
            discipline: doc.discipline,
          };
        })
      );
      // Set relationships of matches
      const matchesIds = emptyMatchesDocs.insertedIds;
      const groupedMatchesByLeg = extractMatchesByLegs(
        doc.size,
        matchesIds,
        matchesPairs
      );
      const matchesByLegsToUpdate = Object.keys(groupedMatchesByLeg).reduce(
        (acc, key) =>
          Object.assign({}, acc, {
            [key]: groupedMatchesByLeg[key].map(match => match.id),
          }),
        {}
      );
      const matchesToUpdate = mapMatchesToUpdate(doc.size, groupedMatchesByLeg);

      // Update the matches
      // NOTE: clearing the cache should not be necessary as those matches
      // have just been created.
      await Promise.all(
        matchesToUpdate.map(match => {
          const isoDate = new Date().toISOString();
          return context.db.matches.updateOne(
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
      await context.db.tournaments.updateOne(
        { _id: args.tournamentId },
        {
          $set: Object.assign(
            {
              lastModifiedAt: new Date().toISOString(),
              status: 'IN_PROGRESS',
            },
            matchesByLegsToUpdate
          ),
        }
      );
      return context.loaders.tournaments
        .clear(args.tournamentId)
        .load(args.tournamentId);
    },
    /**
     * Given a match and the winner team, sets the winner of the current match
     * and put it into the successive match. If there is no `nextMatchId`, the
     * tournament will end, as this was the last match of it.
     * 
     * Args:
     * - tournamentId
     * - matchId
     * - teamKey
     */
    setTournamentMatchWinner: async (obj, args, context) => {
      const doc = await context.loaders.matches.load(args.matchId);
      if (!doc) throw new Error(`Cannot find match with id "${args.matchId}"`);
      // Check that the match had both players set in order to set the winner
      if (!doc.teamLeft || !doc.teamRight)
        throw new Error(
          `The match "${args.matchId}" does not have two teams yet, therefore is not possible to set a winner`
        );

      const teamWinner =
        doc.teamLeft[args.teamKey] || doc.teamRight[args.teamKey];
      if (!teamWinner)
        throw new Error(
          `Cannot set a winner as there is no team matching the key "${args.teamKey}"`
        );

      // Set the winner for the match
      await context.db.matches.updateOne(
        { _id: args.matchId },
        {
          $set: {
            lastModifiedAt: new Date().toISOString(),
            winner: teamWinner,
          },
        }
      );
      // Clear the cache for the updated match
      context.loaders.matches.clear(args.matchId);

      // If the match has a `nextMatchId`, assign the winner to that match
      // otherwise end the tournament.
      if (doc.nextMatchId) {
        const nextDoc = await context.loaders.matches.load(doc.nextMatchId);
        const teamFieldKey = nextDoc.teamLeft ? 'teamRight' : 'teamLeft';
        // Assign the winner to the next match
        await context.db.matches.updateOne(
          { _id: doc.nextMatchId },
          {
            $set: {
              lastModifiedAt: new Date().toISOString(),
              [teamFieldKey]: doc[args.teamKey],
            },
          }
        );
        // Clear the cache for the updated match
        context.loaders.matches.clear(args.nextMatchId);
      } else
        // End the tournament
        await context.db.tournaments.updateOne(
          { _id: args.tournamentId },
          {
            $set: {
              lastModifiedAt: new Date().toISOString(),
              status: 'FINISHED',
            },
          }
        );
      return context.loaders.tournaments
        .clear(args.tournamentId)
        .load(args.tournamentId);
    },
    createQuickMatch: async (obj, args, context) => {
      // Check that the user has access to the given organization
      const organizationDoc = await context.loaders.organizations.load(
        args.organizationKey
      );
      if (!organizationDoc)
        // TODO: return proper status code
        throw new Error('Unauthorized');

      if (args.teamSize < 1)
        throw new Error('Team size must be equal or greater than 1');

      if (args.teamLeft.length !== args.teamSize)
        throw new Error(
          `Team left has ${args.teamLeft
            .length} players, expected ${args.teamSize}`
        );
      if (args.teamRight.length !== args.teamSize)
        throw new Error(
          `Team right has ${args.teamRight
            .length} players, expected ${args.teamSize}`
        );

      const playerIds = args.teamLeft.concat(args.teamRight);
      // Validate that players exist within the organization
      const playersDocs = await context.db.organizations
        .find(
          {
            $and: [
              { _id: args.organizationKey },
              { 'users.id': { $in: playerIds } },
            ],
          },
          { _id: 1 }
        )
        .limit(playerIds.length)
        .toArray();
      if (playersDocs.length !== playerIds.length)
        throw new Error(
          `Some of the given players are not members of the organization "${args.organizationKey}"`
        );

      const isoDate = new Date().toISOString();
      const doc = await context.db.matches.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        teamLeft: {
          key: randomToken(6),
          players: args.teamLeft,
        },
        teamRight: {
          key: randomToken(6),
          players: args.teamRight,
        },
        winner: null,
        organizationKey: args.organizationKey,
        discipline: args.discipline,
      });
      return context.loaders.matches.load(doc.insertedId);
    },
  },
};
