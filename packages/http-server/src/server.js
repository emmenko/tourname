/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
// const jwt = require('express-jwt');
// const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const DataLoader = require('dataloader');
const { MongoClient } = require('mongodb');
const executableSchema = require('./schema');

const port = process.env.HTTP_PORT;
const mongoConnectionUrl = `${process.env.MONGO_URL}/tourname`;
const isProd = process.env.NODE_ENV === 'production';

// const checkJwt = jwt({
//   // Dynamically provide a signing key based on the kid in the header and the
//   // singing keys provided by the JWKS endpoint.
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
//   }),

//   // Validate the audience and the issuer.
//   audience: process.env.AUTH0_AUDIENCE,
//   issuer: `https://${process.env.AUTH0_DOMAIN}/`,
//   algorithms: ['RS256'],
// });

const validateJwt = (request, response, next) => {
  const token = request.headers.authorization;
  jwt.verify(
    token,
    process.env.CLIENT_SECRET,
    { algorithms: ['HS256'] },
    (err, verifiedToken) => {
      if (err) throw new Error('UnauthorizedError');
      request.userId = verifiedToken.sub;
      return next();
    }
  );
};

// const connector = new MongoConnector(mongoConnectionUrl);
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
      userId: request.userId,
      // Expose DB collections. Those should be generally used for mutations.
      db: {
        users: db.collection('users'),
        organizations: db.collection('organizations'),
        tournaments: db.collection('tournaments'),
        matches: db.collection('matches'),
      },
      // Expose data loaders. Those should be generally used for queries.
      loaders: {
        userById: new DataLoader(
          ids =>
            db
              .collection('users')
              .find({ _id: ids[0] })
              .toArray(),
          { batch: false }
        ),
        users: new DataLoader(ids =>
          db
            .collection('users')
            .find({ _id: { $in: ids } })
            .sort({ email: 1 })
            .toArray()
        ),
        organizationById: new DataLoader(
          ids =>
            db
              .collection('organizations')
              .find({ _id: ids[0] })
              .toArray(),
          { batch: false }
        ),
        tournamentById: new DataLoader(
          ids =>
            db
              .collection('tournaments')
              .find({ _id: ids[0] })
              .toArray(),
          { batch: false }
        ),
        matchById: new DataLoader(
          ids =>
            db
              .collection('matches')
              .find({ _id: ids[0] })
              .toArray(),
          { batch: false }
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
  server.use('/token', bodyParser.json(), async (req, res) => {
    const idToken = req.body.idToken;
    const clientSecret = process.env.CLIENT_SECRET;
    let decodedToken;
    try {
      decodedToken = jwt.verify(idToken, clientSecret, {
        algorithms: ['RS256'],
      });
    } catch (e) {
      throw new Error('UnauthorizedError', e);
    }
    // Check if the user exists in the DB
    const existingUserDoc = await db
      .collections('users')
      .findOne({ email: decodedToken.email });
    if (!existingUserDoc)
      console.log('user not found, creating a new one', decodedToken.email);

    // Issue a new token
    const jwtToken = {
      // Registred claims (https://tools.ietf.org/html/rfc7519#section-4.1)
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: existingUserDoc.id,
      iss: `https://${process.env.AUTH0_DOMAIN}`,
    };
    res.json({
      token: jwt.sign(jwtToken, process.env.JWT_SECRET, { algorithm: 'RS256' }),
    });
  });
  server.use('/graphql', validateJwt, bodyParser.json(), handleGraphQLRequest);

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
    server.use('/_graphql', (request, response) =>
      bodyParser.json()(request, response, () => {
        if (
          request.body &&
          request.body.variables &&
          request.body.variables.userId
        ) {
          const userId = request.body.variables.userId;
          // eslint-disable-next-line no-param-reassign
          request.userId = userId;
        }
        return handleGraphQLRequest(request, response);
      })
    );
  }

  // eslint-disable-next-line no-unused-vars
  server.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send('Invalid token');
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
