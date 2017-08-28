/* eslint-disable no-console */
const express = require('express');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const bodyParser = require('body-parser');
const { MongoConnector, MongoEntity } = require('apollo-connector-mongodb');
const executableSchema = require('./schema');

const port = process.env.HTTP_PORT || 3000;
const mongoConnectionUrl = `${process.env.MONGO_URL}/tourname`;
const isProd = process.env.NODE_ENV === 'production';

const server = express();

const connector = new MongoConnector(mongoConnectionUrl);
connector.connect().then(() => {
  console.log(`[MongoDB] Connected to database ${mongoConnectionUrl}`);

  const handleGraphQLRequest = graphqlExpress(request => ({
    schema: executableSchema,
    // Pass request information into graphql context to make them
    // available in the resolvers.
    context: {
      // The current "logged in" user, based on the auth token
      // provided with the request
      userId: request.userId,
      loaders: {
        users: new MongoEntity(connector, 'users'),
        organizations: new MongoEntity(connector, 'organizations'),
        tournaments: new MongoEntity(connector, 'tournaments'),
        matches: new MongoEntity(connector, 'matches'),
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
    console.log(`[Server] Running on http://localhost:${port}/graphql`);
    console.log(`View GraphiQL at http://localhost:${port}/graphiql`);
  });
});
