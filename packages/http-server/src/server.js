/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { createClient } = require('@commercetools/sdk-client');
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http');
const DataLoader = require('dataloader');
const { MongoClient } = require('mongodb');
const createAuthMiddleware = require('./utils/create-auth-middleware');
const executableSchema = require('./schema');

const port = process.env.HTTP_PORT;
const mongoConnectionUrl = `${process.env.MONGO_URL}/tourname`;
const isProd = process.env.NODE_ENV === 'production';

const authMiddleware = createAuthMiddleware({
  host: process.env.AUTH0_DOMAIN,
  clientId: process.env.API_CLIENT_ID,
  clientSecret: process.env.API_CLIENT_SECRET,
});
const httpMiddleware = createHttpMiddleware({
  host: `${process.env.AUTH0_DOMAIN}/api/v2`,
});
const httpClient = createClient({
  middlewares: [authMiddleware, httpMiddleware],
});
const AUTH0_USER_FIELDS = 'user_id,email,name,picture,created_at,updated_at';

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the
  // singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: `${process.env.AUTH0_DOMAIN}/api/v2/`,
  issuer: `${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

MongoClient.connect(mongoConnectionUrl, (error, db) => {
  if (error) {
    console.error(
      `[MongoDB] Error connecting to database ${mongoConnectionUrl}`
    );
    process.exit(1);
  }
  console.log(`[MongoDB] Connected to database ${mongoConnectionUrl}`);

  const handleGraphQLRequest = graphqlExpress(request => ({
    schema: executableSchema,
    // Pass request information into graphql context to make them
    // available in the resolvers.
    context: {
      // The current "logged in" user, based on the auth token
      // provided with the request.
      userId: request.user && request.user.sub,
      // Expose DB collections. Those should be generally used for mutations.
      db: {
        users: db.collection('users'),
        organizations: db.collection('organizations'),
        tournaments: db.collection('tournaments'),
        matches: db.collection('matches'),
      },
      // Expose data loaders. Those should be generally used for queries.
      loaders: {
        users: new DataLoader(ids => {
          const queryForIds = encodeURIComponent(
            `user_id:(${ids.join(' OR ')})`
          );
          return httpClient
            .execute({
              uri: `/users?include_fields=true&fields=${encodeURIComponent(
                AUTH0_USER_FIELDS
              )}&q=${queryForIds}`,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.body);
        }),
        organizations: new DataLoader(ids =>
          db
            .collection('organizations')
            .find({ _id: { $in: ids } })
            .toArray()
        ),
        tournaments: new DataLoader(ids =>
          db
            .collection('tournaments')
            .find({ _id: { $in: ids } })
            .toArray()
        ),
        matches: new DataLoader(ids =>
          db
            .collection('matches')
            .find({ _id: { $in: ids } })
            .sort({ createdAt: 1 })
            .toArray()
        ),
      },
      // opticsContext: OpticsAgent.context(request),
    },
  }));

  // TODO: ensure indexes

  const server = express();
  server.use(cors());

  server.use('/graphql', checkJwt, bodyParser.json(), handleGraphQLRequest);

  // TODO: use auth0 workflow for accessing /graphiql
  if (!isProd) {
    server.use(
      '/graphiql',
      graphiqlExpress({
        endpointURL: '/_graphql',
        query: '',
        variables: {
          userId: '',
        },
      })
    );
    server.use('/_graphql', (request, response, next) =>
      bodyParser.json()(request, response, () => {
        if (
          request.body &&
          request.body.variables &&
          request.body.variables.userId
        ) {
          const userId = request.body.variables.userId;
          // eslint-disable-next-line no-param-reassign
          request.user = { sub: userId };
        }
        return handleGraphQLRequest(request, response, next);
      })
    );
  }

  // eslint-disable-next-line no-unused-vars
  server.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json(err);
    }
  });

  // Start the HTTP server
  server.listen(port, () => {
    console.log(`[Server] Running at http://localhost:${port}/graphql`);
    if (!isProd)
      console.log(
        `[Server] GraphiQL running at http://localhost:${port}/graphiql`
      );
  });
});
