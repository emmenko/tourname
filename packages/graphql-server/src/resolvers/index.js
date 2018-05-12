const me = require('./query/me');
const isOrganizationKeyUsed = require('./query/is-organization-key-used');
const organization = require('./query/organization');
const tournaments = require('./query/tournaments');
const singleMatches = require('./query/single-matches');
const auth0Id = require('./user/auth0Id');
const createdAt = require('./user/created-at');
const updatedAt = require('./user/updated-at');
const availableOrganizations = require('./user/available-organizations');
const members = require('./organization/members');
const createOrganization = require('./mutation/create-organization');
const addMemberToOrganization = require('./mutation/add-member-to-organization');
const removeMemberFromOrganization = require('./mutation/remove-member-from-organization');
const promoteMemberToAdmin = require('./mutation/promote-member-to-admin');
const demoteAdminToMember = require('./mutation/demote-admin-to-member');
const createTournament = require('./mutation/create-tournament');
const addPlayerToTeam = require('./mutation/add-player-to-team');
const removePlayerFromTeam = require('./mutation/remove-player-from-team');
const startTournament = require('./mutation/start-tournament');
const setTournamentMatchTeamWinner = require('./mutation/set-tournament-match-team-winner');
const createSingleMatch = require('./mutation/create-single-match');
const setSingleMatchTeamWinner = require('./mutation/set-single-match-team-winner');

module.exports = {
  Query: {
    me,
    isOrganizationKeyUsed,
    organization,
    tournaments,
    singleMatches,
  },
  User: {
    auth0Id,
    createdAt,
    updatedAt,
    availableOrganizations,
  },
  Organization: {
    members,
  },
  Mutation: {
    createOrganization,
    addMemberToOrganization,
    removeMemberFromOrganization,
    promoteMemberToAdmin,
    demoteAdminToMember,
    createTournament,
    addPlayerToTeam,
    removePlayerFromTeam,
    startTournament,
    setTournamentMatchTeamWinner,
    createSingleMatch,
    setSingleMatchTeamWinner,
  },
};
