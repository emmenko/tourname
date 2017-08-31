const uuid = require('uuid/v4');

module.exports = {
  OrganizationInfo: {
    id: obj => obj._id,
  },
  Organization: {
    id: obj => obj._id,
    members: async (obj, args, context) => {
      const normalizedUsers = obj.users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      const docs = await context.loaders.users.loadMany(
        Object.keys(normalizedUsers)
      );
      return docs.map(doc => ({
        id: doc._id,
        isAdmin: normalizedUsers[doc._id].isAdmin,
        email: doc.email,
        firstName: doc.firstName,
        lastName: doc.lastName,
      }));
    },
    activeTournaments: (obj, args, context) =>
      // TODO: find a way to use dataloader: one key -> to many results
      context.db.tournaments
        .find({
          $and: [
            { 'organizations.id': { $eq: obj.id } },
            { status: { $ne: 'FINISHED' } },
          ],
        })
        .sort({ lastModifiedAt: -1 })
        .toArray(),
    finishedTournaments: (obj, args, context) =>
      // TODO: find a way to use dataloader: one key -> to many results
      context.db.tournaments
        .find({
          $and: [
            { 'organizations.id': { $eq: obj.id } },
            { status: { $eq: 'FINISHED' } },
          ],
        })
        .sort({ lastModifiedAt: -1 })
        .toArray(),
  },
  Mutation: {
    createOrganization: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      const doc = await context.db.organizations.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        name: args.name,
        users: [{ id: args.memberId, isAdmin: true }],
      });
      return context.loaders.organizationById.load(doc.insertedId);
    },
    setMemberAsAdmin: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationId, 'users.id': args.memberId },
        { $set: { lastModifiedAt: isoDate, 'users.$.isAdmin': true } }
      );
      return context.loaders.organizationById
        .clear(args.organizationId)
        .load(args.organizationId);
    },
    addMemberToOrganization: async (obj, args, context) => {
      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationId },
        {
          $set: { lastModifiedAt: isoDate },
          $addToSet: { users: { id: args.memberId, isAdmin: false } },
        }
      );
      context.loaders.organizationById
        .clear(args.organizationId)
        .load(args.organizationId);
    },
    removeMemberFromOrganization: async (obj, args, context) => {
      // Only admin members can remove members from the organization
      // TODO: validate that current user is admin.
      // TODO: current user cannot remove itself, instead the org should be removed

      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationId },
        {
          $set: { lastModifiedAt: isoDate },
          $pull: { users: { id: args.memberId } },
        }
      );
      context.loaders.organizationById
        .clear(args.organizationId)
        .load(args.organizationId);
    },
  },
};
