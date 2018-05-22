const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const DataLoader = require('dataloader');
const { fetchUser } = require('./utils/api');
const resolvers = require('./resolvers');
const schemaDirectives = require('./directives');

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.APP_PORT;
const graphqlEndpoint = '/graphql';

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  schemaDirectives,
  context: ({ request }) => ({
    request, // pass the `request` to be used by resolvers/directives
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
      endpoint: process.env.PRISMA_API_URL, // the endpoint of the Prisma API
      debug: process.env.DEBUG === 'true', // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    }),
    loaders: {
      users: new DataLoader(ids => {
        const queryForIds = encodeURIComponent(`user_id:(${ids.join(' OR ')})`);
        return fetchUser(queryForIds);
      }),
    },
  }),
});
server.express.post(
  graphqlEndpoint,
  // eslint-disable-next-line no-unused-vars
  (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json(err);
    }
  }
);

server.start(
  {
    port,
    endpoint: graphqlEndpoint,
    playground: isProd ? false : '/playground',
  },
  () => console.log(`Server is running on http://localhost:${port}`)
);
