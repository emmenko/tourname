/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const DataLoader = require('dataloader');
const { MongoClient } = require('mongodb');
const executableSchema = require('./schema');

const port = process.env.HTTP_PORT || 3000;
const mongoConnectionUrl = `${process.env.MONGO_URL}/tourname`;
const isProd = process.env.NODE_ENV === 'production';

const server = express();

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

  server.use('/graphql', bodyParser.json(), handleGraphQLRequest);

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

  // Start the HTTP server
  server.listen(port, () => {
    console.log(`[Server] Running at http://localhost:${port}/graphql`);
    if (!isProd)
      console.log(
        `[Server] GraphiQL running at http://localhost:${port}/graphiql`
      );
  });
});
