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
    /**
     * Args:
     * - name
     * - memberId
     */
    createOrganization: async (obj, args, context) => {
      const userDoc = await context.loaders.userById.load(args.memberId);
      if (!userDoc)
        throw new Error(`Cannot find member with id "${args.memberId}"`);

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
    // TODO: allow to remove an organization.
    // - check that needs to be cleaned up
    // removeOrganization
    /**
     * Only admin members can set other members as admin.
     * 
     * Args:
     * - organizationId
     * - memberId
     */
    setMemberAsAdmin: async (obj, args, context) => {
      if (context.userId === args.memberId)
        throw new Error(
          `You cannot set yourself admin of the organization "${args.organizationId}"`
        );
      const orgDoc = await context.loaders.organizationById.load(
        args.organizationId
      );
      if (!orgDoc)
        throw new Error(
          `Cannot find organization with id "${args.organizationId}"`
        );
      const userSelfInOrg = orgDoc.users.find(
        user => user.id === context.userId
      );
      if (!userSelfInOrg)
        throw new Error(
          `You are not part of the organization "${args.organizationId}"`
        );
      if (!userSelfInOrg.isAdmin)
        throw new Error(
          `You are not an admin of the organization "${args.organizationId}". Only admins can promote users to admin`
        );

      const targetUserDoc = await context.loaders.userById.load(args.memberId);
      if (!targetUserDoc)
        throw new Error(
          `The member "${args.memberId}" that you are trying to promote to admin does not exist`
        );

      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationId, 'users.id': args.memberId },
        // The positional $ operator acts as a placeholder for the first
        // element that matches the query document.
        { $set: { lastModifiedAt: isoDate, 'users.$.isAdmin': true } }
      );
      return context.loaders.organizationById
        .clear(args.organizationId)
        .load(args.organizationId);
    },
    /**
     * Args:
     * - organizationId
     * - memberId
     */
    addMemberToOrganization: async (obj, args, context) => {
      const orgDoc = await context.loaders.organizationById.load(
        args.organizationId
      );
      if (!orgDoc)
        throw new Error(
          `Cannot find organization with id "${args.organizationId}"`
        );

      const targetUserDoc = await context.loaders.userById.load(args.memberId);
      if (!targetUserDoc)
        throw new Error(
          `The member "${args.memberId}" that you are trying to add does not exist`
        );

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
    /**
     * Only admin members can remove members from an organization.
     * 
     * Args:
     * - organizationId
     * - memberId
     */
    removeMemberFromOrganization: async (obj, args, context) => {
      // Only admin members can remove members from the organization
      // TODO: validate that current user is admin.
      // TODO: current user cannot remove itself, instead the org should be removed
      if (context.userId === args.memberId)
        throw new Error(
          `You cannot remove yourself from the organization "${args.organizationId}"`
        );
      const orgDoc = await context.loaders.organizationById.load(
        args.organizationId
      );
      if (!orgDoc)
        throw new Error(
          `Cannot find organization with id "${args.organizationId}"`
        );
      const userSelfInOrg = orgDoc.users.find(
        user => user.id === context.userId
      );
      if (!userSelfInOrg)
        throw new Error(
          `You are not part of the organization "${args.organizationId}"`
        );
      if (!userSelfInOrg.isAdmin)
        throw new Error(
          `You are not an admin of the organization "${args.organizationId}". Only admins can remove members`
        );

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
