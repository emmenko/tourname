const requireGraphql = require('../../utils/require-graphql')(__dirname);
const resolvers = require('./resolvers');

const schema = requireGraphql('./schema.gql');

module.exports = { schema, resolvers };
