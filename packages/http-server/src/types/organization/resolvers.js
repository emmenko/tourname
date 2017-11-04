module.exports = {
  Query: {
    isOrganizationKeyUsed: async (obj, args, context) => {
      const numberOfMatches = await context.db.organizations
        .find({ _id: args.key }, { _id: 1 })
        .limit(1)
        .count();
      return numberOfMatches > 0;
    },
    organization: (obj, args, context) =>
      context.loaders.organizations.load(args.key),
  },
  OrganizationInfo: {
    key: obj => obj._id,
  },
  Organization: {
    key: obj => obj._id,
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
          isAdmin: normalizedUsers[doc.user_id].isAdmin, // The `user_id` field comes from auth0
        })
      );
    },
    tournaments: (obj, args, context) => {
      // TODO: find a way to use dataloader: one key -> to many results
      const queryConditions = [{ 'organizations._id': { $eq: obj.key } }];
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

      const existingOrgForGivenKey = await context.db.organizations.load(
        args.key
      );
      if (existingOrgForGivenKey)
        throw new Error(`An organization for key "${args.key}" already exist`);

      const isoDate = new Date().toISOString();
      const doc = await context.db.organizations.insertOne({
        _id: args.key, // NOTE: we use a "user-friendly" identifier as the primary key
        createdAt: isoDate,
        lastModifiedAt: isoDate,
        name: args.name,
        users: [{ id: context.userId, isAdmin: true }],
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
     * - organizationKey
     * - memberId
     */
    setMemberAsAdmin: async (obj, args, context) => {
      if (context.userId === args.memberId)
        throw new Error(
          `You cannot set yourself admin of the organization "${args.organizationKey}"`
        );

      // Check that the user has access to the given organization
      const organizationDoc = await context.loaders.organizations.load(
        args.organizationKey
      );
      if (!organizationDoc)
        // TODO: return proper status code
        throw new Error('Unauthorized');

      const userSelfInOrg = organizationDoc.users.find(
        user => user.id === context.userId
      );
      if (!userSelfInOrg.isAdmin)
        throw new Error(
          `You are not an admin of the organization "${args.organizationKey}". Only admins can promote users to admin`
        );

      // TODO: find a better way to check if the user exists in auth0
      const targetUserDoc = await context.loaders.users.load(args.memberId);
      if (!targetUserDoc)
        throw new Error(
          `The member "${args.memberId}" that you are trying to promote to admin does not exist`
        );

      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationKey, 'users.id': args.memberId },
        // The positional $ operator acts as a placeholder for the first
        // element that matches the query document.
        { $set: { lastModifiedAt: isoDate, 'users.$.isAdmin': true } }
      );
      return context.loaders.organizations
        .clear(args.organizationKey)
        .load(args.organizationKey);
    },
    /**
     * Args:
     * - organizationKey
     * - memberId
     */
    addMemberToOrganization: async (obj, args, context) => {
      // Check that the user has access to the given organization
      const organizationDoc = await context.loaders.organizations.load(
        args.organizationKey
      );
      if (!organizationDoc)
        // TODO: return proper status code
        throw new Error('Unauthorized');

      // TODO: find a better way to check if the user exists in auth0
      const targetUserDoc = await context.loaders.users.load(args.memberId);
      if (!targetUserDoc)
        throw new Error(
          `The member "${args.memberId}" that you are trying to add does not exist`
        );

      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationKey },
        {
          $set: { lastModifiedAt: isoDate },
          $addToSet: { users: { id: args.memberId, isAdmin: false } },
        }
      );
      context.loaders.organizations
        .clear(args.organizationKey)
        .load(args.organizationKey);
    },
    /**
     * Only admin members can remove members from an organization.
     * 
     * Args:
     * - organizationKey
     * - memberId
     */
    removeMemberFromOrganization: async (obj, args, context) => {
      // Only admin members can remove members from the organization
      // TODO: validate that current user is admin.
      // TODO: current user cannot remove itself, instead the org should be removed
      if (context.userId === args.memberId)
        throw new Error(
          `You cannot remove yourself from the organization "${args.organizationKey}"`
        );

      // Check that the user has access to the given organization
      const organizationDoc = await context.loaders.organizations.load(
        args.organizationKey
      );
      if (!organizationDoc)
        // TODO: return proper status code
        throw new Error('Unauthorized');

      const userSelfInOrg = organizationDoc.users.find(
        user => user.id === context.userId
      );
      if (!userSelfInOrg.isAdmin)
        throw new Error(
          `You are not an admin of the organization "${args.organizationKey}". Only admins can remove members`
        );

      const isoDate = new Date().toISOString();
      await context.db.organizations.updateOne(
        { _id: args.organizationKey },
        {
          $set: { lastModifiedAt: isoDate },
          $pull: { users: { id: args.memberId } },
        }
      );
      context.loaders.organizations
        .clear(args.organizationKey)
        .load(args.organizationKey);
    },
  },
};
