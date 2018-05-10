/* eslint-disable no-param-reassign */
const { defaultFieldResolver } = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const hasUserAccessToOrganization = require('../validations/has-user-access-to-organization');

const isProd = process.env.NODE_ENV === 'production';

// https://auth0.com/docs/apis#signing-algorithms
const SIGNATURE_ALGORITHM_RS256 = 'RS256';

const setUserInRequestContextFromJwt = context =>
  new Promise((resolve, reject) => {
    // NOTE: for local development, in order to use GraphQL Playground
    // we would to authenticate the requests by using signed JWT from Auth0.
    // However, since we are using the `RS256` signing algorithm, which uses an
    // asymmetric signature, only Auth0 can sign the JWT using a private key
    // and we can only verify the JWT using the public key.
    // For that reason, when using the GraphQL Playground we pass a custom header
    // which will skip the JWT validation. This is only possible in dev mode.
    const userIdFromHeaders = context.request.headers['x-graphql-userid'];
    if (userIdFromHeaders) {
      if (isProd) {
        console.warn('Ignoring header "X-GraphQL-UserId" in production mode.');
      } else {
        console.warn(
          'You are passing a header "X-GraphQL-UserId", which is used to skip the JWT check. This is usually helpful when developing with GraphQL Playground. BE CAREFUL not to enable this on production!'
        );
        context.userId = userIdFromHeaders;
        return resolve();
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
    })(context.request, null, error => {
      if (error) reject(error);
      else {
        // Alias user id
        context.userId = context.request.user.sub;
        resolve();
      }
    });
  });

class IsAuthenticatedDirective extends SchemaDirectiveVisitor {
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...args) => {
      const params = args[1];
      const context = args[2];
      // Validate JWT token first, then put the user id into the context
      // for fast access from the resolvers.
      await setUserInRequestContextFromJwt(context);
      // If a `role` argument is provided, check that the user has access
      // to the organization (assumed to be given by the query/mutation
      // arguments) with the given `role`.
      if (this.args.role)
        await hasUserAccessToOrganization(this.args.role, params, context);
      return resolve.apply(this, args);
    };
  }
}

module.exports = IsAuthenticatedDirective;
