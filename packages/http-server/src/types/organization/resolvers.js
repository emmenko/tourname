const uuid = require('uuid/v4');

module.exports = {
  Query: {
    isOrganizationKeyUsed: async (obj, args, context) => {
      const doc = await context.db.organizations.findOne({ key: args.key });
      return Boolean(doc);
    },
    organizationByKey: (obj, args, context) =>
      context.db.organizations.findOne({
        $and: [{ key: args.key }, { 'users.id': context.userId }],
      }),
  },
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
      return docs.map(doc =>
        Object.assign({}, doc, {
          isAdmin: normalizedUsers[doc.user_id].isAdmin,
        })
      );
    },
    tournaments: (obj, args, context) => {
      // TODO: find a way to use dataloader: one key -> to many results
      const queryConditions = [{ 'organizations.id': { $eq: obj.id } }];
      if (args.status && args.status.length > 0)
        queryConditions.push({ $or: args.status.map(status => ({ status })) });

      return context.db.tournaments
        .find({ $and: queryConditions })
        .skip(args.page > 0 ? (args.page - 1) * args.perPage : 0)
        .limit(args.perPage)
        .sort({ [args.sort.key]: args.sort.order === 'ASC' ? 1 : -1 })
        .toArray();
    },
  },
  Mutation: {
    /**
     * Args:
     * - key
     * - name
     * - memberId
     */
    createOrganization: async (obj, args, context) => {
      // TODO: find a better way to check if the user exists in auth0
      const userDoc = await context.loaders.users.load(args.memberId);
      if (!userDoc)
        throw new Error(`Cannot find member with id "${args.memberId}"`);

      const existingOrgForGivenKey = await context.db.organizations.findOne({
        key: args.key,
      });
      if (existingOrgForGivenKey)
        throw new Error(`An organization for key "${args.key}" already exist`);

      const isoDate = new Date().toISOString();
      const doc = await context.db.organizations.insertOne({
        _id: uuid(),
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        key: args.key,
        name: args.name,
        users: [{ id: args.memberId, isAdmin: true }],
      });
      return context.loaders.organizations.load(doc.insertedId);
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
      const orgDoc = await context.loaders.organizations.load(
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

      // TODO: find a better way to check if the user exists in auth0
      const targetUserDoc = await context.loaders.users.load(args.memberId);
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
      return context.loaders.organizations
        .clear(args.organizationId)
        .load(args.organizationId);
    },
    /**
     * Args:
     * - organizationId
     * - memberId
     */
    addMemberToOrganization: async (obj, args, context) => {
      const orgDoc = await context.loaders.organizations.load(
        args.organizationId
      );
      if (!orgDoc)
        throw new Error(
          `Cannot find organization with id "${args.organizationId}"`
        );

      // TODO: find a better way to check if the user exists in auth0
      const targetUserDoc = await context.loaders.users.load(args.memberId);
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
      context.loaders.organizations
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
      const orgDoc = await context.loaders.organizations.load(
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
      context.loaders.organizations
        .clear(args.organizationId)
        .load(args.organizationId);
    },
  },
};
