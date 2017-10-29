const crypto = require('crypto');
const merge = require('lodash.merge');
const { makeExecutableSchema } = require('graphql-tools');
const pkg = require('../package.json');
const requireGraphql = require('./utils/require-graphql')(__dirname);
const user = require('./types/user');
const organization = require('./types/organization');
const tournament = require('./types/tournament');

const schemaDefinition = requireGraphql('./root.gql');

module.exports = makeExecutableSchema({
  typeDefs: [
    schemaDefinition,
    user.schema,
    organization.schema,
    tournament.schema,
  ],
  resolvers: merge(
    {
      Query: {
        // Just a placeholder, as type cannot be empty
        version: () => pkg.version,
      },
      Mutation: {
        // Just a placeholder, as type cannot be empty
        random: (obj, args) =>
          crypto.randomBytes(args.byteLength).toString('hex'),
      },
    },
    user.resolvers,
    organization.resolvers,
    tournament.resolvers
  ),
});
