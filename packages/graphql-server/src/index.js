const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const DataLoader = require('dataloader');
const { fetchUser } = require('./utils/api');
const resolvers = require('./resolvers');

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.APP_PORT;
const graphqlEndpoint = '/graphql';

// https://auth0.com/docs/apis#signing-algorithms
const SIGNATURE_ALGORITHM_RS256 = 'RS256';

const checkJwt = (request, response, next) => {
  // NOTE: for local development, in order to use GraphQL Playground
  // we would to authenticate the requests by using signed JWT from Auth0.
  // However, since we are using the `RS256` signing algorithm, which uses an
  // asymmetric signature, only Auth0 can sign the JWT using a private key
  // and we can only verify the JWT using the public key.
  // For that reason, when using the GraphQL Playground we pass a custom header
  // which will skip the JWT validation. This is only possible in dev mode.
  const userIdFromHeaders = request.headers['x-graphql-userid'];
  if (userIdFromHeaders) {
    if (isProd) {
      console.warn('Ignoring header "X-GraphQL-UserId" in production mode.');
    } else {
      console.warn(
        'You are passing a header "X-GraphQL-UserId", which is used to skip the JWT check. This is usually helpful when developing with GraphQL Playground. BE CAREFUL not to enable this on production!'
      );
      request.user = { sub: userIdFromHeaders };
      return next();
    }
  }
  return jwt({
    // Dynamically provide a signing key based on the kid in the header and the
    // signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    audience: `${process.env.AUTH0_DOMAIN}/api/v2/`,
    issuer: `${process.env.AUTH0_DOMAIN}/`,
    algorithms: [SIGNATURE_ALGORITHM_RS256],
  })(request, response, next);
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: ({ request }) => ({
    userId: request.user && request.user.sub,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
      endpoint: process.env.PRISMA_API_URL, // the endpoint of the Prisma API
      debug: !isProd, // log all GraphQL queries & mutations sent to the Prisma API
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
  checkJwt,
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
