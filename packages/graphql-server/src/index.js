const cors = require('cors');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const DataLoader = require('dataloader');
const { fetchUser } = require('./utils/api');

const SIGNATURE_ALGORITHM_HS256 = 'HS256';

const isProd = process.env.NODE_ENV === 'production';

const resolvers = {
  Query: {
    me: (parent, args, context) =>
      // Active userId is implicit in `context`
      context.loaders.users.load(context.userId),
    isOrganizationKeyUsed: async (parent, args, context) => {
      // NOTE: using `context.db.exists.Organization({ key: args.key })`
      // does not work as the internal query `organizations` requires
      // a sub selection.
      //   `Error: Field 'organizations' of type 'Organization' must have a sub selection. (line 2, column 3))`
      const org = await context.db.query.organization(
        { where: { key: args.key } },
        '{ key }'
      );
      return Boolean(org);
    },
    organization: (parent, args, context, info) =>
      context.db.query.organization({ where: { key: args.key } }, info),
  },
  User: {
    id: parent => parent.user_id, // The `user_id` field comes from auth0
    createdAt: parent => parent.created_at,
    updatedAt: parent => parent.updated_at,
    role: async (parent, args, context) => {
      if (parent.role) return parent.role;
      const userRef = await context.db.query.userRef({
        where: { auth0Id: context.userId },
      });
      return userRef.role;
    },
    availableOrganizations: (parent, args, context) =>
      context.db.query.organizations({
        orderBy: 'name_ASC',
        where: { users_every: { auth0Id: context.userId } },
      }),
  },
  Organization: {
    users: async (parent, args, context) => {
      const normalizedUsers = parent.users.reduce((acc, user) => {
        acc[user.auth0Id] = user;
        return acc;
      }, {});
      const docs = await context.loaders.users.loadMany(
        Object.keys(normalizedUsers)
      );
      return docs.map(doc =>
        Object.assign({}, doc, {
          role: normalizedUsers[doc.user_id].role, // The `user_id` field comes from auth0
        })
      );
    },
    tournaments: (parent, args, context) =>
      context.db.query.tournaments({
        first: args.perPage,
        skip: args.page > 0 ? (args.page - 1) * args.perPage : 0,
        orderBy: `${args.sort.key}_${args.sort.order.toUpperCase()}`,
        where: {
          status_in: args.status || [],
        },
      }),
  },
  // Mutation: {
  //   createDraft(parent, { title, text }, ctx, info) {
  //     return ctx.db.mutation.createPost(
  //       {
  //         data: {
  //           title,
  //           text,
  //         },
  //       },
  //       info
  //     );
  //   },
  //   deletePost(parent, { id }, ctx, info) {
  //     return ctx.db.mutation.deletePost({ where: { id } }, info);
  //   },
  //   publish(parent, { id }, ctx, info) {
  //     return ctx.db.mutation.updatePost(
  //       {
  //         where: { id },
  //         data: { isPublished: true },
  //       },
  //       info
  //     );
  //   },
  // },
};

const checkJwt = jwt({
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
  algorithms: [SIGNATURE_ALGORITHM_HS256],
});

const port = process.env.APP_PORT;
const graphqlEndpoint = '/graphql';

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req =>
    Object.assign({}, req, {
      db: new Prisma({
        typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
        endpoint: process.env.PRISMA_API_URL, // the endpoint of the Prisma API
        debug: !isProd, // log all GraphQL queries & mutations sent to the Prisma API
        // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
      }),
      loaders: {
        users: new DataLoader(ids => {
          const queryForIds = encodeURIComponent(
            `user_id:(${ids.join(' OR ')})`
          );
          return fetchUser(queryForIds);
        }),
      },
    }),
});
server.express.use(cors());
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
