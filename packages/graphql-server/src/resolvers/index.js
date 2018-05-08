const me = require('./query/me');
const isOrganizationKeyUsed = require('./query/is-organization-key-used');
const organization = require('./query/organization');
const id = require('./user/id');
const createdAt = require('./user/created-at');
const updatedAt = require('./user/updated-at');
const availableOrganizations = require('./user/available-organizations');
const members = require('./organization/members');
const tournaments = require('./organization/tournaments');
const createOrganization = require('./mutation/create-organization');
const addMemberToOrganization = require('./mutation/add-member-to-organization');
const removeMemberFromOrganization = require('./mutation/remove-member-from-organization');
const promoteMemberToAdmin = require('./mutation/promote-member-to-admin');
const demoteAdminToMember = require('./mutation/demote-admin-to-member');
const createTournament = require('./mutation/create-tournament');

module.exports = {
  Query: {
    me,
    isOrganizationKeyUsed,
    organization,
  },
  User: {
    id,
    createdAt,
    updatedAt,
    availableOrganizations,
  },
  Organization: {
    members,
    tournaments,
  },
  Mutation: {
    createOrganization,
    addMemberToOrganization,
    removeMemberFromOrganization,
    promoteMemberToAdmin,
    demoteAdminToMember,
    createTournament,
  },
};
