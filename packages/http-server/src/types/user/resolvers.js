module.exports = {
  Query: {
    me: (obj, args, context) =>
      // Active userId is implicit in `context`
      context.loaders.users.load(context.userId),
  },
  MemberInfo: {
    id: obj => obj.user_id,
    createdAt: obj => obj.created_at,
    lastModifiedAt: obj => obj.updated_at,
  },
  Member: {
    id: obj => obj.user_id,
    createdAt: obj => obj.created_at,
    lastModifiedAt: obj => obj.updated_at,
    availableOrganizations: (obj, args, context) =>
      // TODO: find a way to use dataloader: one key -> to many results
      context.db.organizations
        .find({ 'users.id': context.userId })
        .sort({ name: 1 })
        .toArray(),
    matches: (obj, args, context) =>
      // TODO: find a way to use dataloader: one key -> to many results
      context.db.matches
        .find({ $or: [{ playerLeftId: obj._id }, { playerRightId: obj._id }] })
        .sort({ lastModifiedAt: -1 })
        .toArray(),
  },
};
