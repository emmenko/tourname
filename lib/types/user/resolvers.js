const uuid = require('uuid/v4');

module.exports = {
  Query: {
    me: (obj, args, context) =>
      // Active userId is implicit in `context`
      context.db.collection('users').findOne({ _id: context.userId }),
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
  },
};
