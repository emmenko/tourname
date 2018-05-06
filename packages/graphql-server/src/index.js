const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');

const resolvers = {
  Query: {
    // me: (parent, args, ctx, info) => {
    //   return ctx.db.query.posts({ where: { isPublished: true } }, info);
    // },
    isOrganizationKeyUsed: async (parent, args, context) => {
      // NOTE: using `context.db.exists.Organization({ key: args.key })`
      // does not work as the internal query `organizations` requires
      // a sub selection.
      //   Error: Field 'organizations' of type 'Organization' must have a sub selection. (line 2, column 3))
      const org = await context.db.query.organization(
        { where: { key: args.key } },
        '{ key }'
      );
      return Boolean(org);
    },
    organization: (parent, args, context, info) =>
      context.db.query.organization({ where: { key: args.key } }, info),
  },
  Organization: {
    // members: async (parent, args, context) => {
    //   const normalizedUsers = parent.users.reduce((acc, user) => {
    //     acc[user.auth0Id] = user;
    //     return acc;
    //   }, {});
    //   const docs = await context.loaders.users.loadMany(
    //     Object.keys(normalizedUsers)
    //   );
    //   return docs.map(doc =>
    //     Object.assign({}, doc, {
    //       role: normalizedUsers[doc.user_id].role, // The `user_id` field comes from auth0
    //     })
    //   );
    // },
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

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req =>
    Object.assign({}, req, {
      db: new Prisma({
        typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
        endpoint: process.env.PRISMA_API_URL, // the endpoint of the Prisma API
        debug: true, // log all GraphQL queries & mutations sent to the Prisma API
        // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
      }),
    }),
});

const port = process.env.APP_PORT;

server.start({ port }, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
