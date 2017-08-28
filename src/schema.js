const uuid = require('uuid/v4');
const shuffle = require('lodash.shuffle');
const { makeExecutableSchema } = require('graphql-tools');

const tournamentSizeMap = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 16,
  XLARGE: 32,
};

// Construct a schema, using GraphQL schema language
const typeDefs = `
  enum Discipline {
    TABLE_TENNIS
    POOL_TABLE
  }

  enum TournamentSize {
    SMALL
    MEDIUM
    LARGE
    XLARGE
  }

  enum TournamentStatus {
    NEW
    IN_PROGRESS
    FINISHED
  }

  type OrganizationInfo {
    id: String!
    name: String!
  }

  interface User {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    email: String!
    firstName: String!
    lastName: String!
  }

  type MemberInfo implements User {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    isAdmin: Boolean!
    email: String!
    firstName: String!
    lastName: String!
  }

  type Member implements User {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    email: String!
    firstName: String!
    lastName: String!
    availableOrganizations: [OrganizationInfo]!
    organization(id: String): Organization
    # The list of matches played by this player
    matches: [Match]!
    # TODO: add statistics (matchesWon, matchesLost)
  }

  type PlayerInfo {
    id: String!
    email: String!
    firstName: String!
    lastName: String!
  }

  # A match describes who is playing against who, and who the winner was
  type Match {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    playerLeft: PlayerInfo
    playerRight: PlayerInfo
    winner: PlayerInfo
  }

  # Matches of a next leg level are created when all the matches of the previous leg level are finished
  interface Tournament {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    discipline: Discipline!
    name: String!
    organizationId: String!
    status: TournamentStatus!
    players: [PlayerInfo]!
  }

  type TournamentSmall implements Tournament {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    discipline: Discipline!
    name: String!
    organizationId: String!
    status: TournamentStatus!
    # Small: 4 players
    players: [PlayerInfo]!
    matchesLeg1: [Match]! # 2 matches
    matchesLeg2: Match # 1 match
  }

  type TournamentMedium implements Tournament {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    discipline: Discipline!
    name: String!
    organizationId: String!
    status: TournamentStatus!
    # Small: 8 players
    players: [PlayerInfo]!
    matchesLeg1: [Match]! # 4 matches
    matchesLeg2: [Match]! # 2 matches
    matchesLeg3: Match # 1 match
  }

  type TournamentLarge implements Tournament {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    discipline: Discipline!
    name: String!
    organizationId: String!
    status: TournamentStatus!
    # Small: 16 players
    players: [PlayerInfo]!
    matchesLeg1: [Match]! # 8 matches
    matchesLeg2: [Match]! # 4 matches
    matchesLeg3: [Match]! # 2 matches
    matchesLeg4: Match # 1 match
  }

  type TournamentXLarge implements Tournament {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    discipline: Discipline!
    name: String!
    organizationId: String!
    status: TournamentStatus!
    # Small: 32 players
    players: [PlayerInfo]!
    matchesLeg1: [Match]! # 16 matches
    matchesLeg2: [Match]! # 8 matches
    matchesLeg3: [Match]! # 4 matches
    matchesLeg4: [Match]! # 2 matches
    matchesLeg5: Match # 1 match
  }

  type TournamentInfo {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    discipline: Discipline!
    name: String!
    status: TournamentStatus!
    size: TournamentSize!
  }

  type Organization {
    id: String!
    createdAt: String!
    lastModifiedAt: String!
    name: String!
    members: [MemberInfo]!
    activeTournaments: [TournamentInfo]!
    finishedTournaments: [TournamentInfo]!
  }

  type Query {
    me: Member!
    tournament(id: String!): Tournament
    # Can be used for "searching" players to be added to a tournament
    # searchMember(text: String!): [MemberInfo]!
    # TODO: statistics
  }

  type Mutation {
    createUser(
      email: String!,
      firstName: String!,
      lastName: String!
    ): Member!

    # Every member can create an organization
    createOrganization(
      memberId: String!,
      name: String!
    ): Organization

    setMemberAsAdmin(
      memberId: String!,
      organizationId: String!
    ): Organization

    # Every member can add new members to the organization
    addMemberToOrganization(
      memberId: String!,
      organizationId: String!
    ): Organization

    # Only admin members can remove members from the organization
    removeMemberFromOrganization(
      memberId: String!,
      organizationId: String!
    ): Organization

    # Every member can create a new tournament
    createSmallTournament(
      name: String!,
      discipline: Discipline!,
      organizationId: String!
    ): TournamentSmall

    createMediumTournament(
      name: String!,
      discipline: Discipline!,
      organizationId: String!
    ): TournamentMedium

    createLargeTournament(
      name: String!,
      discipline: Discipline!,
      organizationId: String!
    ): TournamentLarge

    createXLargeTournament(
      name: String!,
      discipline: Discipline!,
      organizationId: String!
    ): TournamentXLarge

    # Called when a member wants to join a tournament
    addPlayerToTournament(
      id: String!,
      memberId: String!
    ): Tournament

    # Called when a member wants to pull out of a tournament
    removePlayerFromTournament(
      id: String!,
      memberId: String!
    ): Tournament

    # Will create the first matches of leg1 and change the status to "IN_PROGRESS"
    # NOTE: this can be triggered only when the tournament has the correct amount
    # of players
    startTournament(id: String!): Tournament

    # If it's the last match of a leg, the matches of the next leg level will be
    # created. If it's the last match of the tournament, the tournament will be
    # set as finished.
    # This action is irreversible, once the winner is set, it cannot be
    # changed.
    setMatchWinner(
      tournamentId: String!,
      matchId: String!,
      playerId: String!
    ): Tournament
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    me: (obj, args, context) =>
      // Active userId is implicit in `context`
      context.db.collection('users').findOne({ _id: context.userId }),
    tournament: (obj, args, context) =>
      context.db.collection('tournaments').findOne({ _id: args.id }),
  },
  Member: {
    id: obj => obj._id,
    availableOrganizations: async (obj, args, context) => {
      const docs = await context.db
        .collection('organizations')
        .find({ 'users.id': context.userId })
        .sort({ name: 1 })
        .toArray();
      return docs.map(doc => ({ id: doc._id, name: doc.name }));
    },
    organization: (obj, args, context) =>
      args.id
        ? context.db.collection('organizations').findOne({ _id: args.id })
        : context.db
            .collection('organizations')
            .findOne({}, { sort: { name: 1 } }),
    matches: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ $or: [{ playerLeftId: obj._id }, { playerRightId: obj._id }] })
        .sort({ lastModifiedAt: -1 })
        .toArray(),
  },
  PlayerInfo: {
    id: obj => obj._id,
  },
  Organization: {
    id: obj => obj._id,
    members: async (obj, args, context) => {
      const normalizedUsers = obj.users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      const docs = await context.db
        .collection('users')
        .find({ _id: { $in: Object.keys(normalizedUsers) } })
        .sort({ email: 1 })
        .toArray();
      return docs.map(doc => ({
        id: doc._id,
        isAdmin: normalizedUsers[doc._id].isAdmin,
        email: doc.email,
        firstName: doc.firstName,
        lastName: doc.lastName,
      }));
    },
    activeTournaments: (obj, args, context) =>
      context.db
        .collection('tournaments')
        .find({
          $and: [
            { 'organizations.id': { $eq: obj.id } },
            { status: { $ne: 'FINISHED' } },
          ],
        })
        .sort({ lastModifiedAt: -1 })
        .toArray(),
    finishedTournaments: (obj, args, context) =>
      context.db
        .collection('tournaments')
        .find({
          $and: [
            { 'organizations.id': { $eq: obj.id } },
            { status: { $eq: 'FINISHED' } },
          ],
        })
        .sort({ lastModifiedAt: -1 })
        .toArray(),
  },
  Tournament: {
    __resolveType: (obj, context, info) => {
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
    players: (obj, args, context) =>
      context.db
        .collection('users')
        .find({ _id: { $in: obj.players } })
        .sort({ email: 1 })
        .toArray(),
    matchesLeg1: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.db.collection('matches').findOne({ _id: obj.matchesLeg2 }),
  },
  TournamentMedium: {
    id: obj => obj._id,
    players: (obj, args, context) =>
      context.db
        .collection('users')
        .find({ _id: { $in: obj.players } })
        .sort({ email: 1 })
        .toArray(),
    matchesLeg1: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg2 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg3: (obj, args, context) =>
      context.db.collection('matches').findOne({ _id: obj.matchesLeg3 }),
  },
  TournamentLarge: {
    id: obj => obj._id,
    players: (obj, args, context) =>
      context.db
        .collection('users')
        .find({ _id: { $in: obj.players } })
        .sort({ email: 1 })
        .toArray(),
    matchesLeg1: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg2 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg3: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg3 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg4: (obj, args, context) =>
      context.db.collection('matches').findOne({ _id: obj.matchesLeg4 }),
  },
  TournamentXLarge: {
    id: obj => obj._id,
    players: (obj, args, context) =>
      context.db
        .collection('users')
        .find({ _id: { $in: obj.players } })
        .sort({ email: 1 })
        .toArray(),
    matchesLeg1: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg1 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg2: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg2 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg3: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg3 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg4: (obj, args, context) =>
      context.db
        .collection('matches')
        .find({ _id: { $in: obj.matchesLeg4 } })
        .sort({ createdAt: 1 })
        .toArray(),
    matchesLeg5: (obj, args, context) =>
      context.db.collection('matches').findOne({ _id: obj.matchesLeg5 }),
  },
  Match: {
    id: obj => obj._id,
    playerLeft: (obj, args, context) =>
      context.db.collection('users').findOne({ _id: obj.playerLeftId }),
    playerRight: (obj, args, context) =>
      context.db.collection('users').findOne({ _id: obj.playerRightId }),
    winner: (obj, args, context) =>
      context.db.collection('users').findOne({ _id: obj.winnerId }),
  },
  Mutation: {
    // TODO: remove once a proper (social) login flow it implemented
    createUser: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const collection = context.db.collection('users');
      const doc = await collection.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
      });
      return collection.findOne({ _id: doc.ops[0]._id });
    },
    createOrganization: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const collection = context.db.collection('organizations');
      const doc = await collection.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        name: args.name,
        users: [{ id: args.memberId, isAdmin: true }],
      });
      return collection.findOne({ _id: doc.ops[0]._id });
    },
    setMemberAsAdmin: async (obj, args, context) => {
      const collection = context.db.collection('organizations');
      const isoDate = new Date().toISOString();
      await collection.updateOne(
        { _id: args.organizationId, 'users.id': args.memberId },
        { $set: { lastModifiedAt: isoDate, 'users.$.isAdmin': true } }
      );
      return collection.findOne({ _id: args.organizationId });
    },
    addMemberToOrganization: async (obj, args, context) => {
      const collection = context.db.collection('organizations');
      const isoDate = new Date().toISOString();
      await collection.updateOne(
        { _id: args.organizationId },
        {
          $set: { lastModifiedAt: isoDate },
          $addToSet: { users: { id: args.memberId, isAdmin: false } },
        }
      );
      return collection.findOne({ _id: args.organizationId });
    },
    removeMemberFromOrganization: async (obj, args, context) => {
      // Only admin members can remove members from the organization
      // TODO: validate that current user is admin.
      // TODO: current user cannot remove itself, instead the org should be removed

      const collection = context.db.collection('organizations');
      const isoDate = new Date().toISOString();
      await collection.updateOne(
        { _id: args.organizationId },
        {
          $set: { lastModifiedAt: isoDate },
          $pull: { users: { id: args.memberId } },
        }
      );
      return collection.findOne({ _id: args.organizationId });
    },
    // Every member can create a new tournament
    createSmallTournament: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const collection = context.db.collection('tournaments');
      const doc = await collection.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'SMALL',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        players: [],
        matchesLeg1: [],
        matchesLeg2: null,
      });
      return collection.findOne({ _id: doc.insertedId });
    },
    createMediumTournament: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const collection = context.db.collection('tournaments');
      const doc = await collection.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'MEDIUM',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        players: [],
        matchesLeg1: [],
        matchesLeg2: [],
        matchesLeg3: null,
      });
      return collection.findOne({ _id: doc.insertedId });
    },
    createLargeTournament: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const collection = context.db.collection('tournaments');
      const doc = await collection.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'LARGE',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        players: [],
        matchesLeg1: [],
        matchesLeg2: [],
        matchesLeg3: [],
        matchesLeg4: null,
      });
      return collection.findOne({ _id: doc.insertedId });
    },
    createXLargeTournament: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const collection = context.db.collection('tournaments');
      const doc = await collection.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        size: 'XLARGE',
        discipline: args.discipline,
        name: args.name,
        organizationId: args.organizationId,
        status: 'NEW',
        players: [],
        matchesLeg1: [],
        matchesLeg2: [],
        matchesLeg3: [],
        matchesLeg4: [],
        matchesLeg5: null,
      });
      return collection.findOne({ _id: doc.insertedId });
    },
    addPlayerToTournament: async (obj, args, context) => {
      // TODO: validation
      // - the tournament is not started it
      // - there are no more player slots available

      const userDoc = await context.db
        .collection('users')
        .findOne({ _id: args.memberId });
      // TODO: throw if user is not found
      const collection = context.db.collection('tournaments');
      const isoDate = new Date().toISOString();
      await context.db.collection('tournaments').updateOne(
        { _id: args.id },
        {
          $set: { lastModifiedAt: isoDate },
          $addToSet: { players: userDoc._id },
        }
      );
      return collection.findOne({ _id: args.id });
    },
    removePlayerFromTournament: async (obj, args, context) => {
      // TODO: validation
      // - the tournament is not started it

      const collection = context.db.collection('tournaments');
      const isoDate = new Date().toISOString();
      const doc = await collection.updateOne(
        { _id: args.id },
        { $set: { lastModifiedAt: isoDate }, $pull: { players: args.memberId } }
      );
      return collection.findOne({ _id: args.id });
    },
    // Will create the first matches of leg1 and change the status to "IN_PROGRESS"
    // NOTE: this can be triggered only when the tournament has the correct amount
    // of players
    startTournament: async (obj, args, context) => {
      const doc = await context.db
        .collection('tournaments')
        .findOne({ _id: args.id });

      const expectedNumberOfPlayers = tournamentSizeMap[doc.size];
      if (doc.players.length < expectedNumberOfPlayers)
        throw new Error(
          `Not enough number of players, expected a total of ${expectedNumberOfPlayers}`
        );

      // Shuffle the list of players to randomly determine first matches
      const shuffledListOfPlayers = shuffle(doc.players);
      // Build a list of matches pairs by picking two adiacent players
      const matchesPairs = shuffledListOfPlayers.reduce(
        (acc, player, index) => {
          if (index % 2 === 0)
            acc.push(shuffledListOfPlayers.slice(index, index + 2));
          return acc;
        },
        []
      );

      const numberOfMatches = expectedNumberOfPlayers - 1;
      // Create all (empty) matches for this tournament
      const emptyMatchesDocs = await context.db
        .collection('matches')
        .insertMany(
          Array.from(new Array(numberOfMatches)).map(() => {
            const isoDate = new Date().toISOString();
            return {
              _id: uuid(),
              createdAt: isoDate,
              lastModifiedAt: isoDate,
              playerLeftId: null,
              playerRightId: null,
              winnerId: null,
              nextMatchId: null,
              tournamentId: args.id,
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
            playerLeftId: matchesPairs[index][0],
            playerRightId: matchesPairs[index][1],
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
            playerLeftId: null,
            playerRightId: null,
          }));
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg2[index] : matchesLeg2[index - 1],
            playerLeftId: matchesPairs[index][0],
            playerRightId: matchesPairs[index][1],
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
            playerLeftId: null,
            playerRightId: null,
          }));
          const matchesLeg2 = matchesIds.splice(-4).map(id => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg3[index] : matchesLeg3[index - 1],
            playerLeftId: null,
            playerRightId: null,
          }));
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg2[index] : matchesLeg2[index - 1],
            playerLeftId: matchesPairs[index][0],
            playerRightId: matchesPairs[index][1],
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
          const matchesLeg4 = matchesIds.splice(-2).map(id => ({
            id,
            nextMatchId: matchesLeg5[0],
            playerLeftId: matchesPairs[index][0],
            playerRightId: matchesPairs[index][1],
          }));
          const matchesLeg3 = matchesIds.splice(-4).map(id => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg4[index] : matchesLeg4[index - 1],
            playerLeftId: null,
            playerRightId: null,
          }));
          const matchesLeg2 = matchesIds.splice(-8).map(id => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg3[index] : matchesLeg3[index - 1],
            playerLeftId: null,
            playerRightId: null,
          }));
          const matchesLeg1 = matchesIds.map((id, index) => ({
            id,
            nextMatchId:
              index % 2 === 0 ? matchesLeg2[index] : matchesLeg2[index - 1],
            playerLeftId: matchesPairs[index][0],
            playerRightId: matchesPairs[index][1],
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
          return context.db.collection('matches').updateOne(
            { _id: match.id },
            {
              $set: {
                lastModifiedAt: isoDate,
                nextMatchId: match.nextMatchId,
                playerLeftId: match.playerLeftId,
                playerRightId: match.playerRightId,
              },
            }
          );
        })
      );

      // Update the tournament
      await context.db.collection('tournaments').updateOne(
        { _id: args.id },
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
      return context.db.collection('tournaments').findOne({ _id: args.id });
    },
    // If it's the last match of a leg, the matches of the next leg level will be
    // created. If it's the last match of the tournament, the tournament will be
    // set as finished.
    // This action is irreversible, once the winner is set, it cannot be
    // changed.
    setMatchWinner: async (obj, args, context) => {
      const doc = await context.db
        .collection('matches')
        .findOne({ _id: args.matchId });

      // Check that the match had both players set in order to set the winner
      if (!doc.playerLeftId || !doc.playerRightId)
        throw new Error(`Cannot set match winner with only one player`);

      // Set the winner for the match
      await context.db.collection('matches').updateOne(
        { _id: args.matchId },
        {
          $set: {
            lastModifiedAt: new Date().toISOString(),
            winnerId: args.playerId,
          },
        }
      );

      // If the match has a `nextMatchId`, assign the winner to that match
      // otherwise end the tournament.
      if (doc.nextMatchId) {
        const nextDoc = await context.db
          .collection('matches')
          .findOne({ _id: doc.nextMatchId });
        const updatePlayerKey = nextDoc.playerLeftId
          ? 'playerRightId'
          : 'playerLeftId';
        // Assign the winner to the next match
        await context.db.collection('matches').updateOne(
          { _id: doc.nextMatchId },
          {
            $set: {
              lastModifiedAt: new Date().toISOString(),
              [updatePlayerKey]: args.playerId,
            },
          }
        );
      } else
        // End the tournament
        await context.db.collection('tournaments').updateOne(
          { _id: args.tournamentId },
          {
            $set: {
              lastModifiedAt: new Date().toISOString(),
              status: 'FINISHED',
            },
          }
        );
      return context.db
        .collection('tournaments')
        .findOne({ _id: args.tournamentId });
    },
  },
};

// Required: Export the GraphQL.js schema object as "schema"
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = { schema };
