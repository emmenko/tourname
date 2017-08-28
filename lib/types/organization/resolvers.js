const uuid = require('uuid/v4');

module.exports = {
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
  Mutation: {
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
  },
};
