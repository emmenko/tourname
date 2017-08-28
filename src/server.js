const express = require('express');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { schema } = require('./schema');

const PORT = 3000;
const server = express();

const mongoConnectionUrl = `${process.env.MONGO_URL}/tourname`;

MongoClient.connect(mongoConnectionUrl).then(db => {
  console.log(`[MongoDB] Connected to database ${mongoConnectionUrl}`);

  // TODO: ensure indexes

  server.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress(request => {
      let userId;
      if (
        request.body &&
        request.body.variables &&
        request.body.variables.userId
      ) {
        userId = request.body.variables.userId;
      }
      return {
        schema,
        // context: context(request.headers, process.env),
        context: { db, userId },
      }
    })
  );

  server.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      query: ``,
    })
  );

  // Start the HTTP server
  server.listen(PORT, () => {
    console.log(
      `GraphQL Server is now running on http://localhost:${PORT}/graphql`
    );
    console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
  });
});
