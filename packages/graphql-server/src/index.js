const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const DataLoader = require('dataloader');
const { fetchUser } = require('./utils/api');

// https://auth0.com/docs/apis#signing-algorithms
const SIGNATURE_ALGORITHM_RS256 = 'RS256';

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
    organization: async (parent, args, context, info) => {
      const orgs = await context.db.query.organizations(
        {
          where: {
            AND: [
              { key: args.key },
              { memberRefs_every: { auth0Id: context.userId } },
            ],
          },
          first: 1,
        },
        info
      );
      if (orgs && orgs.length > 0) return orgs[0];
      // TODO: return proper status code
      throw new Error(`Organization with key "${args.key}" not found`);
    },
  },
  User: {
    id: parent => parent.user_id, // The `user_id` field comes from auth0
    createdAt: parent => parent.created_at,
    updatedAt: parent => parent.updated_at,
    availableOrganizations: (parent, args, context) =>
      context.db.query.organizations({
        orderBy: 'name_ASC',
        where: {
          memberRefs_every: { auth0Id: context.userId },
        },
      }),
  },
  Organization: {
    members: async (parent, args, context) => {
      const orgs = await context.db.query.organizations(
        {
          where: {
            AND: [
              { key: args.key },
              { memberRefs_every: { auth0Id: context.userId } },
            ],
          },
          first: 1,
        },
        '{ memberRefs { auth0Id role } }'
      );
      if (orgs && orgs.length === 0)
        // TODO: return proper status code
        throw new Error(`Organization with key "${args.key}" not found`);
      const org = orgs[0];

      const normalizedMemberRefs = org.memberRefs.reduce((acc, memberRef) => {
        acc[memberRef.auth0Id] = memberRef;
        return acc;
      }, {});
      const docs = await context.loaders.users.loadMany(
        Object.keys(normalizedMemberRefs)
      );
      return docs.map(doc => ({
        id: doc.user_id,
        email: doc.email,
        name: doc.name,
        picture: doc.picture,
        role: normalizedMemberRefs[doc.user_id].role,
      }));
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
  Mutation: {
    /**
     * Args:
     * - key
     * - name
     */
    createOrganization: async (parent, args, context) => {
      const existingOrgForGivenKey = await context.db.query.organization({
        where: { key: args.key },
      });
      if (existingOrgForGivenKey)
        throw new Error(`An organization for key "${args.key}" already exist`);

      return context.db.mutation.createOrganization({
        data: {
          key: args.key,
          name: args.name,
          memberRefs: {
            create: [{ auth0Id: context.userId, role: 'Admin' }],
          },
        },
      });
    },
    // TODO: allow to remove an organization.
    // - check that needs to be cleaned up
    // removeOrganization
    /**
     * Only admin users can set other users as admin.
     *
     * Args:
     * - organizationKey
     * - memberId
     */
    promoteMemberToAdmin: async (parent, args, context) => {
      if (context.userId === args.memberId)
        throw new Error(
          `You cannot set yourself admin of the organization "${
            args.organizationKey
          }"`
        );

      // Check that the user has access to the given organization
      // and is an admin
      const organizationResults = await context.db.query.organizations({
        where: {
          AND: [
            { key: args.organizationKey },
            {
              memberRefs_every: {
                AND: [{ auth0Id: context.userId }, { role: 'Admin' }],
              },
            },
          ],
        },
      });
      if (!organizationResults || organizationResults.length === 0)
        // TODO: return proper status code
        throw new Error(
          `The organization with key "${
            args.organizationKey
          }" is either not found or you are not an Admin of such organization. In case you are part of the organization, remember that only admins can promote users to admin.`
        );

      // TODO: find a better way to check if the user exists in auth0
      const targetUserDoc = await context.loaders.users.load(args.memberId);
      if (!targetUserDoc)
        throw new Error(
          `The user "${
            args.memberId
          }" that you are trying to promote to admin does not exist`
        );

      // Check if the `memberId` is alredy Admin
      const memberAdminResult = await context.db.memberRefs({
        where: {
          AND: [
            { auth0Id: args.memberId },
            { role: 'Admin' },
            { organization: { key: args.organizationKey } },
          ],
        },
      });
      if (memberAdminResult && memberAdminResult.length > 0)
        throw new Error(
          `The member "${
            args.memberId
          }" is already an Admin of the organization "${args.organizationKey}"`
        );

      await context.db.mutation.updateManyMemberRefs({
        where: {
          AND: [
            { auth0Id: args.memberId },
            { organization: { key: args.organizationKey } },
          ],
        },
        data: {
          role: 'Admin',
        },
      });

      // Return optimistic update
      return Object.assign({}, memberAdminResult[0], {
        role: 'Admin',
      });
    },
    /**
     * Args:
     * - organizationKey
     * - memberId
     */
    // addMemberToOrganization: async (parent, args, context) => {
    //   // Check that the user has access to the given organization
    //   const organizationDoc = await context.loaders.organizations.load(
    //     args.organizationKey
    //   );
    //   if (!organizationDoc)
    //     // TODO: return proper status code
    //     throw new Error('Unauthorized');

    //   // TODO: find a better way to check if the user exists in auth0
    //   const targetUserDoc = await context.loaders.users.load(args.userId);
    //   if (!targetUserDoc)
    //     throw new Error(
    //       `The user "${args.userId}" that you are trying to add does not exist`
    //     );

    //   const isoDate = new Date().toISOString();
    //   await context.db.organizations.updateOne(
    //     { _id: args.organizationKey },
    //     {
    //       $set: { lastModifiedAt: isoDate },
    //       $addToSet: { users: { id: args.userId, isAdmin: false } },
    //     }
    //   );
    //   context.loaders.organizations
    //     .clear(args.organizationKey)
    //     .load(args.organizationKey);
    // },
    /**
     * Only admin users can remove users from an organization.
     *
     * Args:
     * - organizationKey
     * - userId
     */
    // removeUserFromOrganization: async (parent, args, context) => {
    //   // Only admin users can remove users from the organization
    //   // TODO: validate that current user is admin.
    //   // TODO: current user cannot remove itself, instead the org should be removed
    //   if (context.userId === args.userId)
    //     throw new Error(
    //       `You cannot remove yourself from the organization "${
    //         args.organizationKey
    //       }"`
    //     );

    //   // Check that the user has access to the given organization
    //   const organizationDoc = await context.loaders.organizations.load(
    //     args.organizationKey
    //   );
    //   if (!organizationDoc)
    //     // TODO: return proper status code
    //     throw new Error('Unauthorized');

    //   const userSelfInOrg = organizationDoc.users.find(
    //     user => user.id === context.userId
    //   );
    //   if (!userSelfInOrg.isAdmin)
    //     throw new Error(
    //       `You are not an admin of the organization "${
    //         args.organizationKey
    //       }". Only admins can remove users`
    //     );

    //   const isoDate = new Date().toISOString();
    //   await context.db.organizations.updateOne(
    //     { _id: args.organizationKey },
    //     {
    //       $set: { lastModifiedAt: isoDate },
    //       $pull: { users: { id: args.userId } },
    //     }
    //   );
    //   context.loaders.organizations
    //     .clear(args.organizationKey)
    //     .load(args.organizationKey);
    // },
  },
};

const checkJwt = (request, response, next) => {
  const userIdFromHeaders = request.headers['x-graphql-userid'];
  if (userIdFromHeaders) {
    if (isProd) {
      console.warn('Ignoring header "X-GraphQL-UserId" is production mode.');
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

const port = process.env.APP_PORT;
const graphqlEndpoint = '/graphql';

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
